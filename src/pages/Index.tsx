import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

export default function Index() {
  return (
    <div className="dukaio-landing">
      

<header>
  <div className="wrap nav">
    <div className="logo">Duka<span>io</span></div>
    <nav className="nav-links">
      <a href="#marketplace">Marketplace</a>
      <a href="#produit">Produit</a>
      <a href="#securite">Sécurité</a>
      <a href="#faq">FAQ</a>
    </nav>
    <div className="nav-right">
      <Link className="login" to="/login">Connexion</Link>
      <Link className="btn btn-primary" to="/register">Commencer gratuitement</Link>
    </div>
  </div>
</header>

<section className="hero" style={{ paddingBottom: '64px' }}>
  <div className="wrap hero-grid">
    <div>
      <span className="eyebrow">Vendre en Afrique, simplement</span>
      <h1>Votre savoir-faire mérite d'être payé. <em>Partout, tout de suite.</em></h1>
      <p className="sub">Dukaio permet aux créateurs africains de vendre e-books, formations, licences et fichiers numériques — livraison instantanée, paiements Mobile Money et carte, encaissés en toute sécurité.</p>
      <div className="hero-ctas">
        <Link className="btn btn-primary" to="/register">Commencer gratuitement</Link>
        <a className="btn btn-ghost" href="#produit">Voir une démo</a>
      </div>
      <div className="hero-note">Aucune carte requise · Mise en ligne en 10 minutes</div>
    </div>
    <div className="mock">
      <div className="mock-topbar">
        <div className="mock-dot"></div><div className="mock-dot"></div><div className="mock-dot"></div>
      </div>
      <div className="mock-title">TABLEAU DE BORD — CE MOIS-CI</div>
      <div className="mock-stats">
        <div className="mock-stat"><div className="num">1 240 000</div><div className="lbl">FCFA de revenus</div></div>
        <div className="mock-stat"><div className="num">86</div><div className="lbl">ventes</div></div>
        <div className="mock-stat"><div className="num">4</div><div className="lbl">produits actifs</div></div>
      </div>
      <div className="mock-bars">
        <div style={{ height: '30%' }}></div><div style={{ height: '45%' }}></div><div style={{ height: '38%' }}></div>
        <div style={{ height: '60%' }}></div><div style={{ height: '52%' }}></div><div style={{ height: '75%' }}></div>
        <div style={{ height: '68%' }}></div><div style={{ height: '90%' }}></div><div style={{ height: '80%' }}></div>
        <div style={{ height: '100%' }}></div><div style={{ height: '85%' }}></div><div style={{ height: '95%' }}></div>
      </div>
    </div>
  </div>
</section>

<div className="ticker-band">
  <div className="ticker-track">
    <span className="tick"><span className="dot"></span>Vente confirmée · Formation Marketing Digital · <b>Cotonou</b> · MTN MoMo · 5 000 FCFA</span>
    <span className="tick"><span className="dot"></span>Vente confirmée · E-book Recettes · <b>Dakar</b> · Wave · 3 000 FCFA</span>
    <span className="tick"><span className="dot"></span>Vente confirmée · Licence Template Canva · <b>Abidjan</b> · Orange Money · 7 500 FCFA</span>
    <span className="tick"><span className="dot"></span>Vente confirmée · Guide Freelance PDF · <b>Lagos</b> · Carte bancaire · 4 200 FCFA</span>
    <span className="tick"><span className="dot"></span>Vente confirmée · Formation Trading · <b>Lomé</b> · MTN MoMo · 10 000 FCFA</span>
    <span className="tick"><span className="dot"></span>Vente confirmée · Formation Marketing Digital · <b>Cotonou</b> · MTN MoMo · 5 000 FCFA</span>
    <span className="tick"><span className="dot"></span>Vente confirmée · E-book Recettes · <b>Dakar</b> · Wave · 3 000 FCFA</span>
    <span className="tick"><span className="dot"></span>Vente confirmée · Licence Template Canva · <b>Abidjan</b> · Orange Money · 7 500 FCFA</span>
    <span className="tick"><span className="dot"></span>Vente confirmée · Guide Freelance PDF · <b>Lagos</b> · Carte bancaire · 4 200 FCFA</span>
    <span className="tick"><span className="dot"></span>Vente confirmée · Formation Trading · <b>Lomé</b> · MTN MoMo · 10 000 FCFA</span>
  </div>
</div>

<div className="trust wrap">
  <div className="trust-row">
    <div className="pay-badges">
      <span>Orange Money</span><span>MTN MoMo</span><span>Wave</span><span>Moov Money</span><span>Visa</span><span>Mastercard</span>
    </div>
    <div className="kyc-badge">Plateforme vérifiée KYC</div>
  </div>
</div>

<section style={{ padding: '0' }}>
  <div className="wrap" style={{ paddingTop: '64px', paddingBottom: '0' }}>
    <div className="stats-row">
      <div className="stat"><div className="num">100%</div><div className="lbl">VENDEURS VÉRIFIÉS KYC</div></div>
      <div className="stat"><div className="num">24h–5j</div><div className="lbl">DÉLAI DE PAIEMENT</div></div>
      <div className="stat"><div className="num">10+</div><div className="lbl">MOYENS DE PAIEMENT</div></div>
      <div className="stat"><div className="num">0 FCFA</div><div className="lbl">FRAIS D'INSCRIPTION</div></div>
    </div>
  </div>
</section>

<section id="marketplace">
  <div className="wrap">
    <div className="mkt-head">
      <div>
        <span className="eyebrow">Marketplace</span>
        <h2>Découvrez la marketplace Dukaio</h2>
      </div>
      <a className="btn btn-ghost" href="#">Explorer la marketplace</a>
    </div>
    <div className="mkt-grid">
      <div className="prod-card">
        <div className="prod-thumb" style={{ background: 'var(--ink)' }}>Créer du contenu avec l'IA</div>
        <div className="prod-body">
          <div className="prod-tag">Formation</div>
          <div className="prod-title">Créer du contenu avec l'IA — guide complet</div>
          <div className="prod-foot"><span className="prod-price">900 FCFA</span><a className="prod-buy" href="#">Acheter →</a></div>
        </div>
      </div>
      <div className="prod-card">
        <div className="prod-thumb" style={{ background: 'var(--blue-deep)' }}>Réussir ses Ads Facebook</div>
        <div className="prod-body">
          <div className="prod-tag">Formation</div>
          <div className="prod-title">Comment réussir ses publicités Facebook</div>
          <div className="prod-foot"><span className="prod-price">1 000 FCFA</span><a className="prod-buy" href="#">Acheter →</a></div>
        </div>
      </div>
      <div className="prod-card">
        <div className="prod-thumb" style={{ background: 'var(--blue)' }}>100 premières ventes</div>
        <div className="prod-body">
          <div className="prod-tag">E-book</div>
          <div className="prod-title">Gagner ses premières 100–1000€ avec l'e-book</div>
          <div className="prod-foot"><span className="prod-price">22 000 FCFA</span><a className="prod-buy" href="#">Acheter →</a></div>
        </div>
      </div>
      <div className="prod-card">
        <div className="prod-thumb" style={{ background: 'var(--ink-soft)' }}>Sécurité téléphonie</div>
        <div className="prod-body">
          <div className="prod-tag">Guide PDF</div>
          <div className="prod-title">Sécuriser son téléphone contre le vol de données</div>
          <div className="prod-foot"><span className="prod-price">2 500 FCFA</span><a className="prod-buy" href="#">Acheter →</a></div>
        </div>
      </div>
      <div className="prod-card">
        <div className="prod-thumb" style={{ background: 'var(--blue-deep)' }}>Centre du savoir</div>
        <div className="prod-body">
          <div className="prod-tag">Cours en ligne</div>
          <div className="prod-title">Guide complet pour télécharger et importer un cours</div>
          <div className="prod-foot"><span className="prod-price">200 FCFA</span><a className="prod-buy" href="#">Acheter →</a></div>
        </div>
      </div>
      <div className="prod-card">
        <div className="prod-thumb" style={{ background: 'var(--ink)' }}>Business en ligne</div>
        <div className="prod-body">
          <div className="prod-tag">Formation</div>
          <div className="prod-title">Lancer et structurer son business en ligne</div>
          <div className="prod-foot"><span className="prod-price">400 FCFA</span><a className="prod-buy" href="#">Acheter →</a></div>
        </div>
      </div>
    </div>
  </div>
</section>

<div className="cat-band">
  <div className="cat-track">
    <span className="pill">Ebooks</span><span className="pill">Formations</span><span className="pill">Templates</span>
    <span className="pill">Licences logicielles</span><span className="pill">Guides PDF</span><span className="pill">Automatisations</span>
    <span className="pill">Scripts</span><span className="pill">Musique</span><span className="pill">Presets</span>
    <span className="pill">Illustrations</span><span className="pill">Plugins</span><span className="pill">Tutoriels</span>
    <span className="pill">Ebooks</span><span className="pill">Formations</span><span className="pill">Templates</span>
    <span className="pill">Licences logicielles</span><span className="pill">Guides PDF</span><span className="pill">Automatisations</span>
    <span className="pill">Scripts</span><span className="pill">Musique</span><span className="pill">Presets</span>
    <span className="pill">Illustrations</span><span className="pill">Plugins</span><span className="pill">Tutoriels</span>
  </div>
</div>

<section id="produit">
  <div className="wrap">
    <div className="section-head">
      <span className="eyebrow">Bénéfices</span>
      <h2>Tout ce dont un créateur a besoin pour vivre de son travail.</h2>
      <p>Pas de fonctionnalités superflues — trois choses, bien faites.</p>
    </div>
    <div className="benefits">
      <div className="benefit">
        <span className="n">Vitesse</span>
        <h3>Vendez en 5 minutes</h3>
        <p>Déposez votre fichier, fixez votre prix, partagez votre lien. Pas de code, pas de configuration compliquée.</p>
      </div>
      <div className="benefit">
        <span className="n">Argent</span>
        <h3>Soyez payé, vraiment</h3>
        <p>Mobile Money et carte bancaire acceptés dans plus de 15 pays. Vos revenus arrivent sur votre compte, sans blocage.</p>
      </div>
      <div className="benefit">
        <span className="n">Portée</span>
        <h3>Vendez ici et à l'international</h3>
        <p>Vos produits sont visibles sur la marketplace Dukaio et vendables directement à vos clients, en Afrique comme ailleurs.</p>
      </div>
    </div>
  </div>
</section>

<section style={{ background: 'var(--white-dim)' }}>
  <div className="wrap">
    <div className="section-head">
      <span className="eyebrow">Comment ça marche</span>
      <h2>De l'idée à la première vente, en trois étapes.</h2>
    </div>
    <div className="steps">
      <div className="step">
        <div className="idx">01</div>
        <div><h3>Créez votre boutique</h3><p>Inscrivez-vous et configurez votre espace vendeur en quelques minutes.</p></div>
      </div>
      <div className="step">
        <div className="idx">02</div>
        <div><h3>Ajoutez vos produits</h3><p>E-book, formation, template, licence logicielle : uploadez, fixez le prix, publiez.</p></div>
      </div>
      <div className="step">
        <div className="idx">03</div>
        <div><h3>Encaissez et livrez automatiquement</h3><p>Le client paie par Mobile Money ou carte, Dukaio livre le produit instantanément et crédite votre solde.</p></div>
      </div>
    </div>
  </div>
</section>

<section>
  <div className="wrap">
    <div className="section-head">
      <span className="eyebrow">Fonctionnalités</span>
      <h2>Chaque écran a un seul travail à faire.</h2>
    </div>

    <div className="feature-row">
      <div className="feature-copy">
        <span className="eyebrow">Dashboard</span>
        <h3>Un dashboard qui parle vrai business.</h3>
        <p>Ventes, clients, taux de conversion, revenus par produit : tout est lisible en un coup d'œil, pas noyé sous des graphiques inutiles.</p>
      </div>
      <div className="feature-visual">
        <div className="line">
          <div className="fv-row"><span>Formation Marketing Digital</span><span className="badge">32 ventes</span></div>
          <div className="fv-row"><span>E-book "Vendre sur Mobile Money"</span><span className="badge">18 ventes</span></div>
          <div className="fv-row"><span>Template Business Plan</span><span className="badge">11 ventes</span></div>
          <div className="fv-row"><span>Licence Automatisation</span><span className="badge">6 ventes</span></div>
        </div>
      </div>
    </div>

    <div className="feature-row">
      <div className="feature-copy">
        <span className="eyebrow">Paiements</span>
        <h3>Vos paiements, sans friction.</h3>
        <p>Orange Money, MTN MoMo, Wave, Visa, Mastercard — vos clients paient avec ce qu'ils ont déjà dans leur poche.</p>
      </div>
      <div className="feature-visual">
        <div className="line">
          <div className="fv-row"><span>Orange Money</span><span className="badge">Actif</span></div>
          <div className="fv-row"><span>MTN MoMo</span><span className="badge">Actif</span></div>
          <div className="fv-row"><span>Wave</span><span className="badge">Actif</span></div>
          <div className="fv-row"><span>Visa / Mastercard</span><span className="badge">Actif</span></div>
        </div>
      </div>
    </div>

    <div className="feature-row">
      <div className="feature-copy">
        <span className="eyebrow">Livraison</span>
        <h3>La livraison ne dépend plus de vous.</h3>
        <p>Fichier, lien, accès à une formation : tout est envoyé automatiquement dès l'achat confirmé.</p>
      </div>
      <div className="feature-visual">
        <div className="line">
          <div className="fv-row"><span>Achat confirmé</span><span className="badge">10:42</span></div>
          <div className="fv-row"><span>Fichier envoyé au client</span><span className="badge">10:42</span></div>
          <div className="fv-row"><span>Solde crédité</span><span className="badge">10:43</span></div>
        </div>
      </div>
    </div>
  </div>
</section>

<section className="security" id="securite">
  <div className="wrap">
    <div className="section-head">
      <span className="eyebrow">Sécurité</span>
      <h2>Une plateforme vérifiée et protégée.</h2>
      <p>Chaque vendeur est identifié, chaque transaction est surveillée, chaque donnée est protégée.</p>
    </div>
    <div className="sec-grid">
      <div className="sec-item"><h4>Vérification KYC</h4><p>Chaque vendeur confirme son identité avant de pouvoir encaisser.</p></div>
      <div className="sec-item"><h4>Anti-fraude IA</h4><p>Les transactions suspectes sont détectées et bloquées automatiquement.</p></div>
      <div className="sec-item"><h4>Paiements sécurisés</h4><p>Chaque transaction est chiffrée et traçable de bout en bout.</p></div>
      <div className="sec-item"><h4>Délai de rétractation</h4><p>5 jours de garantie pour l'acheteur avant reversement final au vendeur.</p></div>
      <div className="sec-item"><h4>Détection de doublons</h4><p>Le système repère les tentatives d'achat frauduleux ou dupliqué.</p></div>
      <div className="sec-item"><h4>Données protégées</h4><p>Vos données et celles de vos clients sont chiffrées et conformes au RGPD.</p></div>
    </div>
  </div>
</section>

<section className="quote-spot">
  <div className="wrap quote-inner">
    <div className="avatar">AI</div>
    <p className="quote">Je crois profondément que chaque créateur africain mérite les outils pour transformer son talent en revenu. Dukaio est né de cette conviction : <em>démocratiser la vente digitale en Afrique</em>, sans barrière technique ni complexité inutile.</p>
    <div className="who"><b>Agonan Isidore</b> — Fondateur de Dukaio</div>
  </div>
</section>

<section>
  <div className="wrap">
    <div className="section-head">
      <span className="eyebrow">Témoignages</span>
      <h2>Ils vendent déjà avec Dukaio.</h2>
    </div>
    <div className="testi-grid">
      <div className="testi">
        <div className="stars">★★★★★</div>
        <p className="quote">« J'ai mis ma première formation en ligne en une soirée. Une semaine plus tard, j'avais mes premiers paiements Mobile Money. »</p>
        <div className="who"><b>Ahmonto K.</b> — Formatrice, Cotonou</div>
      </div>
      <div className="testi">
        <div className="stars">★★★★★</div>
        <p className="quote">« Enfin une plateforme qui comprend que mes clients paient en Orange Money, pas en carte bancaire. »</p>
        <div className="who"><b>Moussa D.</b> — Infopreneur, Abidjan</div>
      </div>
      <div className="testi">
        <div className="stars">★★★★★</div>
        <p className="quote">« La livraison automatique m'a fait gagner un temps fou — je ne réponds plus jamais manuellement à un client. »</p>
        <div className="who"><b>Fatou B.</b> — Créatrice de templates, Dakar</div>
      </div>
      <div className="testi">
        <div className="stars">★★★★★</div>
        <p className="quote">« Le dashboard est clair, je sais exactement quel produit marche et lequel retravailler. »</p>
        <div className="who"><b>Jean-Paul M.</b> — Coach business, Lomé</div>
      </div>
    </div>
  </div>
</section>

<section style={{ background: 'var(--white-dim)' }}>
  <div className="wrap">
    <div className="section-head center">
      <span className="eyebrow" style={{ justifyContent: 'center' }}>Traction</span>
      <h2>La confiance de centaines de créateurs.</h2>
    </div>
    <div className="stats-row" style={{ gridTemplateColumns: 'repeat(2,1fr)', maxWidth: '520px', margin: '0 auto' }}>
      <div className="stat"><div className="num">9+</div><div className="lbl">PAYS ACTIFS</div></div>
      <div className="stat"><div className="num">722</div><div className="lbl">CRÉATEURS ACCOMPAGNÉS</div></div>
    </div>
  </div>
</section>

<section id="faq">
  <div className="wrap">
    <div className="section-head">
      <span className="eyebrow">FAQ</span>
      <h2>Questions fréquentes.</h2>
    </div>
    <div className="faq-list">
      <details open>
        <summary>Quels moyens de paiement sont acceptés ?</summary>
        <p>Orange Money, MTN MoMo, Wave, Moov Money, ainsi que les cartes Visa et Mastercard, selon les pays disponibles.</p>
      </details>
      <details>
        <summary>Dans quels pays Dukaio est-il disponible ?</summary>
        <p>Dukaio est actif dans plus de 9 pays d'Afrique francophone et anglophone, avec de nouveaux pays ajoutés régulièrement.</p>
      </details>
      <details>
        <summary>Combien de temps pour recevoir mes paiements ?</summary>
        <p>Vos paiements sont crédités sur votre solde Dukaio entre 24h et 5 jours après chaque vente, selon le moyen de paiement.</p>
      </details>
      <details>
        <summary>Quelle commission Dukaio prend-il ?</summary>
        <p>Une commission simple et transparente est prélevée uniquement sur les ventes réalisées — aucun frais fixe mensuel, aucun frais d'inscription.</p>
      </details>
      <details>
        <summary>Puis-je vendre à l'international ?</summary>
        <p>Oui. Vos produits peuvent être vendus à des clients hors d'Afrique via carte bancaire.</p>
      </details>
    </div>
  </div>
</section>

<section className="final-cta" id="cta">
  <div className="wrap">
    <h2>Votre premier produit peut être en ligne dans 10 minutes.</h2>
    <p>Rejoignez les créateurs qui vendent déjà avec Dukaio.</p>
    <a className="btn btn-primary" href="#">Commencer gratuitement</a>
  </div>
</section>

<footer>
  <div className="wrap">
    <div className="foot-grid">
      <div>
        <div className="logo">Duka<span>io</span></div>
        <p style={{ color: 'var(--slate)', fontSize: '14px', marginTop: '14px', maxWidth: '260px' }}>La plateforme des créateurs digitaux africains.</p>
      </div>
      <div>
        <h5>Produit</h5>
        <ul><li><a href="#">Fichiers</a></li><li><a href="#">Cours</a></li><li><a href="#">Licences</a></li></ul>
      </div>
      <div>
        <h5>Entreprise</h5>
        <ul><li><a href="#">À propos</a></li><li><a href="#">Blog</a></li><li><a href="#">Partenaires</a></li></ul>
      </div>
      <div>
        <h5>Support &amp; Légal</h5>
        <ul><li><a href="#">Documentation</a></li><li><a href="#">Confidentialité</a></li><li><a href="#">Conditions</a></li></ul>
      </div>
    </div>
    <div className="foot-bottom">
      <span>© 2026 Dukaio. Tous droits réservés.</span>
      <span>Fait pour les créateurs africains.</span>
    </div>
  </div>
</footer>


    </div>
  );
}
