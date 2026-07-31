import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const user = userData.user;

    const apiKey = Deno.env.get('DIDIT_API_KEY')!;
    const workflowId = Deno.env.get('DIDIT_WORKFLOW_ID')!;

    const origin = req.headers.get('origin') || 'https://dukaio.com';
    const callback = `${origin}/dashboard/settings?tab=account&kyc=callback`;

    const diditRes = await fetch('https://verification.didit.me/v2/session/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        vendor_data: user.id,
        callback,
        contact_details: { email: user.email, email_lang: 'fr' },
      }),
    });

    const diditJson = await diditRes.json();
    if (!diditRes.ok) {
      console.error('Didit error:', diditJson);
      return new Response(JSON.stringify({ error: 'Didit session creation failed', details: diditJson }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const sessionId = diditJson.session_id || diditJson.id;
    const sessionUrl = diditJson.url || diditJson.verification_url;

    // Service role client for upsert (bypasses RLS check column constraints)
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: existing } = await adminClient
      .from('identity_verifications')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      await adminClient.from('identity_verifications').update({
        didit_session_id: sessionId,
        didit_session_url: sessionUrl,
        status: 'pending',
        rejection_reason: null,
        submitted_at: new Date().toISOString(),
      }).eq('id', existing.id);
    } else {
      await adminClient.from('identity_verifications').insert({
        user_id: user.id,
        document_type: 'didit',
        document_front_url: sessionUrl,
        didit_session_id: sessionId,
        didit_session_url: sessionUrl,
        status: 'pending',
      });
    }

    return new Response(JSON.stringify({ url: sessionUrl, session_id: sessionId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
