import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature, x-timestamp',
};

async function verifySignature(body: string, signature: string, timestamp: string, secret: string): Promise<boolean> {
  // Reject if older than 5 minutes
  const ts = parseInt(timestamp, 10);
  if (!ts || Math.abs(Date.now() / 1000 - ts) > 300) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(body));
  const hex = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
  return hex === signature;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.text();
    const signature = req.headers.get('x-signature') || '';
    const timestamp = req.headers.get('x-timestamp') || '';
    const secret = Deno.env.get('DIDIT_WEBHOOK_SECRET')!;

    const valid = await verifySignature(body, signature, timestamp, secret);
    if (!valid) {
      console.error('Invalid Didit webhook signature');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const event = JSON.parse(body);
    console.log('Didit webhook event:', JSON.stringify(event));

    const sessionId = event.session_id || event.id;
    const status = event.status; // Approved, Declined, In Review, Not Started, etc.
    const vendorData = event.vendor_data; // user_id we passed

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    let newStatus = 'pending';
    let rejectionReason: string | null = null;
    if (status === 'Approved') newStatus = 'approved';
    else if (status === 'Declined') {
      newStatus = 'rejected';
      rejectionReason = event.decision?.reason || event.reason || 'Vérification refusée par Didit';
    } else if (status === 'In Review') newStatus = 'pending';

    // Extract identity fields if available
    const idv = event.decision?.id_verification ?? event.id_verification ?? {};
    const kyc = event.decision?.kyc ?? {};
    const documentNumber: string | null = idv.document_number || kyc.document_number || null;
    const fullName: string | null = idv.full_name || kyc.full_name || null;
    const country: string | null = idv.issuing_state || idv.nationality || kyc.country || null;
    const docType: string | null = idv.document_type || kyc.document_type || null;

    // Resolve user_id first (needed for duplicate check)
    let userId: string | null = vendorData ?? null;
    if (!userId && sessionId) {
      const { data: existing } = await admin.from('identity_verifications')
        .select('user_id').eq('didit_session_id', sessionId).maybeSingle();
      userId = existing?.user_id ?? null;
    }

    // Anti-duplicate: same document already approved for a DIFFERENT user => force rejection
    if (newStatus === 'approved' && documentNumber && userId) {
      const { data: dup } = await admin.from('identity_verifications')
        .select('user_id')
        .eq('document_number', documentNumber)
        .eq('status', 'approved')
        .neq('user_id', userId)
        .maybeSingle();
      if (dup) {
        newStatus = 'rejected';
        rejectionReason = 'Ce document a déjà été utilisé pour vérifier un autre compte Dukaio. Une personne ne peut vérifier qu\'un seul compte.';
        console.warn('Duplicate KYC document detected', { documentNumber, attemptedUser: userId, existingUser: dup.user_id });
      }
    }

    const updateData: any = {
      status: newStatus,
      didit_decision: event,
      reviewed_at: newStatus !== 'pending' ? new Date().toISOString() : null,
      rejection_reason: rejectionReason,
    };
    if (fullName) updateData.full_name = fullName;
    if (country) updateData.country = country;
    if (docType) updateData.document_type = docType;
    if (documentNumber) updateData.document_number = documentNumber;

    if (sessionId) {
      const { data: row } = await admin.from('identity_verifications')
        .update(updateData)
        .eq('didit_session_id', sessionId)
        .select('user_id')
        .maybeSingle();
      if (row?.user_id) userId = row.user_id;
    }

    // Notify user
    if (userId && newStatus !== 'pending') {
      await admin.from('notifications').insert({
        user_id: userId,
        title: newStatus === 'approved' ? '✓ Identité vérifiée' : '✗ Vérification refusée',
        message: newStatus === 'approved'
          ? 'Votre identité a été vérifiée. Vous pouvez maintenant effectuer des retraits.'
          : `Votre vérification a été refusée. ${rejectionReason || ''}`,
        type: newStatus === 'approved' ? 'success' : 'error',
      });
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('Webhook error:', e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
