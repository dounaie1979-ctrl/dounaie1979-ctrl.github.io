/* NATINFLEX – aide à la qualification. Fonctionne hors ligne. Source : nomenclature NATINF (Ministère de la Justice, Licence Ouverte 2.0). */
(function () {
'use strict';
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- stockage (protégé) ---------- */
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};

/* ---------- données ---------- */
let MEM = [], MEM_BY = new Map(), D, ROWS, NAT, E, SCEN, IDX = new Map(), SCEN_BY = new Map(), PRIM = new Map();
const F_NUM = 0, F_NAT = 1, F_LIB = 2, F_DEF = 3, F_REP = 4, F_ROAD = 5, F_PRIM = 6;

const AMAX = ['38 €', '150 €', '450 €', '750 €', '1 500 € (3 000 € en récidive)'];
const FORF = ['11 €', '35 €', '68 €', '135 €'];

/* ---------- libellés lisibles (accents restaurés à l'affichage ; le libellé officiel reste consultable) ---------- */
const ACC = {};
('vehicule:véhicule vehicules:véhicules etat:état delit:délit delits:délits securite:sécurité controle:contrôle controles:contrôles declaration:déclaration activite:activité incapacite:incapacité ' +
 'etablissement:établissement marche:marché autorite:autorité sante:santé peche:pêche prealable:préalable superieure:supérieure superieur:supérieur publicite:publicité categorie:catégorie ' +
 'equipement:équipement equipements:équipements irreguliere:irrégulière irregulier:irrégulier interieures:intérieures interieur:intérieur interieure:intérieure degradation:dégradation dechets:déchets ' +
 'execution:exécution inexecution:inexécution entraine:entraîné presentation:présentation depositaire:dépositaire medicament:médicament medicaments:médicaments destine:destiné destines:destinés ' +
 'aeronef:aéronef matiere:matière matieres:matières depassement:dépassement donnees:données identite:identité conformite:conformité reserve:réservé reservee:réservée reserves:réservés ' +
 'duree:durée presence:présence proprietaire:propriétaire stupefiants:stupéfiants arrete:arrêté etranger:étranger etrangere:étrangère veterinaire:vétérinaire materiel:matériel ' +
 'deterioration:détérioration depot:dépôt denrees:denrées acces:accès espece:espèce caractere:caractère operation:opération operations:opérations qualite:qualité illegale:illégale illegal:illégal ' +
 'delais:délais delai:délai societe:société electronique:électronique elements:éléments element:élément systeme:système infirmite:infirmité realisation:réalisation delivrance:délivrance ' +
 'economique:économique oeuvre:œuvre exercant:exerçant foret:forêt entree:entrée prevention:prévention enlevement:enlèvement agrement:agrément agree:agréé periode:période ' +
 'aggravee:aggravée aggrave:aggravé etiquetage:étiquetage nucleaire:nucléaire coeur:cœur europeenne:européenne classee:classée contrefacon:contrefaçon fondee:fondée equipage:équipage ' +
 'affecte:affecté reception:réception prohibe:prohibé chargee:chargée denomination:dénomination emission:émission reglementation:réglementation reglementaire:réglementaire visibilite:visibilité ' +
 'equipe:équipé reseau:réseau privee:privée defense:défense francais:français automatise:automatisé electrique:électrique regulier:régulier regulierement:régulièrement amenagement:aménagement ' +
 'prelevement:prélèvement materiaux:matériaux falsifies:falsifiés repute:réputé egard:égard remuneration:rémunération caracteristiques:caractéristiques revelation:révélation legal:légal ' +
 'vegetaux:végétaux regle:règle regles:règles motorise:motorisé harcelement:harcèlement procedure:procédure sejour:séjour verification:vérification verifications:vérifications ' +
 'sequestration:séquestration procede:procédé etant:étant interet:intérêt evaluation:évaluation regime:régime benefice:bénéfice solidarite:solidarité numerique:numérique inferieur:inférieur ' +
 'deplacement:déplacement melange:mélange periodique:périodique etre:être ete:été eclairage:éclairage echappement:échappement retroviseur:rétroviseur homologue:homologué attache:attaché ' +
 'genant:gênant genants:gênants tres:très chaussee:chaussée priorite:priorité pieton:piéton pietons:piétons engage:engagé traversee:traversée precede:précède necessite:nécessité ' +
 'arriere:arrière expire:expiré depistage:dépistage etablir:établir prevu:prévu obtemperer:obtempérer arreter:arrêter arret:arrêt expose:exposé telephone:téléphone ecran:écran emettre:émettre ' +
 'retention:rétention malgre:malgré reduit:réduit numero:numéro fourriere:fourrière cedez:cédez ceder:céder autorise:autorisé autorisee:autorisée tenue:tenue ' +
 'recidive:récidive reprimee:réprimée definie:définie evenement:événement vehicle:véhicule liberte:liberté securise:sécurisé metre:mètre metres:mètres degre:degré ' +
 'detecteur:détecteur controlee:contrôlée delivre:délivré delivree:délivrée accompagne:accompagné accompagnement:accompagnement apprentissage:apprentissage eleve:élève ' +
 'brevet:brevet cyclomoteur:cyclomoteur homologuee:homologuée presente:présenté realise:réalisé realisee:réalisée mise:mise gene:gêné genee:gênée ' +
 'concerne:concerné obligatoire:obligatoire obligatoires:obligatoires immatricule:immatriculé deja:déjà cede:cédé accidente:accidenté accidentee:accidentée ' +
 'periodique:périodique ordonne:ordonné ordonnee:ordonnée prescrite:prescrite pense:pensé specialise:spécialisé specialement:spécialement designee:désignée ' +
 'transforme:transformé modifie:modifié modifiee:modifiée neuf:neuf visibles:visibles lisible:lisible illisible:illisible amovible:amovible ' +
 'consigne:consigné considere:considéré geree:gérée gestion:gestion collectivite:collectivité ' + 'exces:excès routiere:routière routieres:routières excedant:excédant excedent:excédent genante:gênante annule:annulé proroge:prorogé pietonne:piétonne pietonnes:piétonnes ferree:ferrée receptionne:réceptionné receptionnee:réceptionnée equide:équidé equides:équidés endossee:endossée acquereur:acquéreur impose:imposé imposee:imposée immobilise:immobilisé immobilisee:immobilisée prevue:prévue prevues:prévues prevus:prévus defaut:défaut detention:détention penal:pénal penale:pénale penales:pénales presomption:présomption reglement:règlement reglements:règlements recepisse:récépissé prefectoral:préfectoral prefecture:préfecture generale:générale general:général emis:émis depart:départ ecole:école ecoles:écoles elevee:élevée etrangers:étrangers epreuve:épreuve epreuves:épreuves medical:médical medicale:médicale medecin:médecin leger:léger legere:légère legers:légers cle:clé agglomeration:agglomération immediate:immédiate immediatement:immédiatement defectueux:défectueux defectueuse:défectueuse degagement:dégagement detenu:détenu detenue:détenue cree:créé creee:créée difficulte:difficulté adaptee:adaptée adapte:adapté reduite:réduite declare:déclaré declares:déclarés etabli:établi evasion:évasion prejudice:préjudice beneficiaire:bénéficiaire resultat:résultat resultats:résultats meconnaissance:méconnaissance surete:sûreté degats:dégâts verifie:vérifié reception:réception regulation:régulation tolere:toléré toleree:tolérée transmis:transmis designe:désigné exerce:exercé exercee:exercée realisee:réalisée mesuree:mesurée commise:commise commis:commis detourne:détourné detournee:détournée precedent:précédent precedente:précédente suivante:suivante tele:télé lies:liés liee:liée sureté:sûreté ').split(/\s+/).forEach(p => { const i = p.indexOf(':'); if (i > 0) ACC[p.slice(0, i)] = p.slice(i + 1); });
const NOUN_BEFORE_A = /^(qui|il|elle|on|n|l|d|lui|ce|cela|ne|y)$/;
const UPPER = /^(ptac|ptra|edpm|ue|ce|cee|ct|fpr|siv|m1|n1|m2|n2|n3|ptrt|cpp|kg)$/;
function fmt(s) {
  const w = s.toLowerCase().split(/(\W+)/);
  for (let i = 0; i < w.length; i++) {
    const t = w[i];
    if (!t || /^\W+$/.test(t)) continue;
    if (t === 'a') {
      const prev = (w[i - 2] || '');
      const next = (w[i + 2] || '');
      if (prev && !NOUN_BEFORE_A.test(prev) && /^[a-z0-9]/.test(next)) w[i] = 'à';
      continue;
    }
    if (ACC[t]) w[i] = ACC[t];
    else if (UPPER.test(t)) w[i] = t.toUpperCase();
  }
  let r = w.join('');
  return r.charAt(0).toUpperCase() + r.slice(1);
}

/* ---------- normalisation / recherche ---------- */
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/['’]/g, ' ').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
const STOP = new Set('le la les l d de du des un une en au aux et ou a pour par sur dans qui que ce il elle est ils elles on y se sa son ses mon ma ne pas plus tres avec volant lui cela ca je tu nous vous'.split(' '));
let SYN = new Map(), REN = new Map(), EXPR = [], CATS = [], VOCAB = null, FAM = [];
const stem = t => (t.length > 3 && /[sx]$/.test(t) && !/ss$/.test(t)) ? t.slice(0, -1) : t;
function initSyn(sy) {
  SYN = new Map(); REN = new Map();
  ((sy && sy.groups) || []).forEach(a => a.forEach(w => { SYN.set(w, a); SYN.set(stem(w), a); }));
  Object.entries((sy && sy.renvois) || {}).forEach(([k, v]) => { const n = norm(k); REN.set(n, v); REN.set(stem(n), v); });
  EXPR = ((sy && sy.expr) || []).map(([x, y]) => [new RegExp('(^| )' + norm(x) + '( |$)', 'g'), norm(y)]);
}
function tokens(q) {
  let n = norm(q); EXPR.forEach(([re, to]) => { n = n.replace(re, (m, a, b) => a + to + b); });
  return n.split(' ').filter(t => t && !STOP.has(t)).map(stem);
}
function alts(t) {
  const a = SYN.get(t) || [t], r = REN.get(t);
  return r ? a.concat(r) : a;
}
// score d'une variante (mot ou expression de plusieurs mots) dans un texte normalisé encadré d'espaces
function altScore(t, a) {
  if (a.indexOf(' ') < 0) {
    if (t.includes(' ' + a + ' ')) return 3;
    if (a.length >= 4 && t.includes(' ' + a)) return 2;
    if (a.length >= 5 && t.includes(a)) return 1;
    return 0;
  }
  for (const w of a.split(' ')) if (!(t.includes(' ' + w + ' ') || (w.length >= 4 && t.includes(' ' + w)))) return 0;
  return 2;
}
let TXT = [];     // texte normalisé de chaque ligne, encadré d'espaces
let ARTS = null;  // articles normalisés de chaque ligne (lazy)

function buildIndex() {
  TXT = ROWS.map(r => ' ' + norm(r[F_LIB]) + ' ');
  ROWS.forEach((r, i) => { IDX.set(r[F_NUM], i); if (r[F_PRIM]) { const k = r[F_PRIM]; (PRIM.get(k) || PRIM.set(k, []).get(k)).push(i); } });
  SCEN.forEach(s => { s._t = ' ' + norm(s.title) + ' '; s._k = ' ' + norm(s.kw + ' ' + s.desc) + ' '; SCEN_BY.set(s.id, s); });
}
function buildArts() {
  const re = /ART\.([LRD]\.\d+(?:-\d+)*|\d+(?:-\d+)*)/g;
  ARTS = ROWS.map(r => {
    const out = {def: ' ', all: ' '};
    for (const m of r[F_DEF].matchAll(re)) { const a = m[1].toLowerCase(); out.def += a + ' '; out.all += a + ' '; }
    for (const m of r[F_REP].matchAll(re)) out.all += m[1].toLowerCase() + ' ';
    return out;
  });
}
function scoreText(t, toks) {
  // renvoie null si un mot n'est pas trouvé ; sinon un score
  let s = 0;
  for (const tk of toks) {
    let best = 0;
    for (const a of alts(tk)) { const x = altScore(t, a); if (x > best) best = x; }
    if (!best) return null;
    s += best;
  }
  return s;
}
let SCOPE = null;   // 'route' | 'gen' | null : cloisonnement Routier / Général (ignoré pour numéro et article)
function search(q, filter) {
  q = q.trim();
  if (!q) return {list: [], mode: 'vide'};
  const fK = i => {
    const r = ROWS[i], k = r[F_NAT];
    switch (filter) {
      case 'route': return r[F_ROAD] === 1;
      case 'contra': return k <= 4 || k === 8;
      case 'delit': return k === 5 || k === 7 || k === 9;
      case 'crime': return k === 6;
      case 'volee': return !!(E[r[F_NUM]] && E[r[F_NUM]].volee);
      default: return true;
    }
  };
  const fOK = i => fK(i) && (!SCOPE || (SCOPE === 'route') === (ROWS[i][F_ROAD] === 1));
  // 1) numéro NATINF
  if (/^\d{1,6}$/.test(q)) {
    const out = [];
    const n = parseInt(q, 10);
    if (IDX.has(n)) out.push(IDX.get(n));
    ROWS.forEach((r, i) => { if (r[F_NUM] !== n && String(r[F_NUM]).startsWith(q) && out.length < 40) out.push(i); });
    return {list: out.filter(fK), mode: 'numéro'};
  }
  // 2) article (ex : L234-1, R.412-6, art 221-18)
  const am = q.toLowerCase().match(/^(?:art(?:icle)?\.?\s*)?([lrd])?\.?\s*(\d+-\d+(?:-\d+)*|\d{3,})\s*$/);
  if (am && (am[1] || /-/.test(am[2]))) {
    if (!ARTS) buildArts();
    const key = (am[1] ? am[1] + '.' : '') + am[2];
    const re = new RegExp((am[1] ? ' ' : ' (?:[lrd]\\.)?') + key.replace(/[.\-]/g, '\\$&') + '(?![0-9-])');
    const out = [];
    ROWS.forEach((r, i) => {
      if (!fK(i)) return;
      if (re.test(ARTS[i].def)) out.push([3 + (r[F_ROAD] ? 1 : 0), i]);
      else if (re.test(ARTS[i].all)) out.push([1 + (r[F_ROAD] ? 1 : 0), i]);
    });
    out.sort((a, b) => b[0] - a[0] || ROWS[a[1]][F_NUM] - ROWS[b[1]][F_NUM]);
    return {list: out.map(x => x[1]), mode: 'article'};
  }
  // 3) texte
  const toks = tokens(q);
  if (!toks.length) return {list: [], mode: 'vide'};
  const scored = [];
  const boost = new Map(), top = rankScen(q)[0], wantRed = /redevable/.test(norm(q));
  if (top) top.groups.forEach(g => g.ids.forEach(n => boost.set(n, Math.max(boost.get(n) || 0, g.role === 'principal' ? 8 : 4))));
  for (let i = 0; i < ROWS.length; i++) {
    if (!fOK(i)) continue;
    const sc = scoreText(TXT[i], toks);
    if (sc === null) continue;
    const r = ROWS[i];
    let b = sc + (r[F_ROAD] ? 1.5 : 0) + (E[r[F_NUM]] && E[r[F_NUM]].pts !== undefined ? 1 : 0) - TXT[i].length / 400 + (boost.get(r[F_NUM]) || 0)
          - (!wantRed && TXT[i].startsWith(' redevable') ? 3 : 0);
    scored.push([b, i]);
  }
  let mode = 'texte';
  if (scored.length < 4 && toks.length > 1) {   // repli : au moins la moitié des mots
    const need = Math.ceil(toks.length / 2), seen = new Set(scored.map(x => x[1]));
    for (let i = 0; i < ROWS.length; i++) {
      if (seen.has(i) || !fOK(i)) continue;
      let hit = 0, sc = 0;
      for (const tk of toks) { const s1 = scoreText(TXT[i], [tk]); if (s1 !== null) { hit++; sc += s1; } }
      if (hit >= need) scored.push([sc * 0.5 + (ROWS[i][F_ROAD] ? 1 : 0) - TXT[i].length / 400 + (boost.get(ROWS[i][F_NUM]) || 0), i]);
    }
    mode = 'approchant';
  }
  scored.sort((a, b) => b[0] - a[0] || ROWS[a[1]][F_NUM] - ROWS[b[1]][F_NUM]);
  return {list: scored.map(x => x[1]), mode, toks};
}
/* ---------- correction des fautes de frappe ---------- */
function lev(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = [], cur = [];
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    cur = [i]; let m = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) cur[j] = Math.min(cur[j], (prevprev[j - 2]) + 1);
      if (cur[j] < m) m = cur[j];
    }
    if (m > max) return max + 1;
    var prevprev = prev; prev = cur;
  }
  return prev[b.length];
}
function buildVocab() {
  VOCAB = new Map();
  TXT.forEach(t => t.split(' ').forEach(w => { if (w.length > 2) VOCAB.set(w, (VOCAB.get(w) || 0) + 1); }));
  SYN.forEach((_, w) => { if (!VOCAB.has(w)) VOCAB.set(w, 1); });
  REN.forEach((_, w) => { if (!VOCAB.has(w)) VOCAB.set(w, 1); });
}
function correct(q) {
  if (!VOCAB) buildVocab();
  const raw = norm(q).split(' ').filter(Boolean);
  let changed = false;
  const out = raw.map(w => {
    if (STOP.has(w) || w.length < 4 || /\d/.test(w) || VOCAB.has(w) || VOCAB.has(stem(w))) return w;
    for (const k of VOCAB.keys()) if (k.length > w.length && k.startsWith(w)) return w;   // début de mot valide
    const max = w.length <= 6 ? 1 : 2;
    let best = null, bd = 9, bc = 0;
    for (const [k, c] of VOCAB) {
      if (k[0] !== w[0] && k[1] !== w[1]) continue;
      const d = lev(w, k, max);
      if (d <= max && (d < bd || (d === bd && c > bc))) { best = k; bd = d; bc = c; }
    }
    if (best) { changed = true; return best; }
    return w;
  });
  return changed ? out.join(' ') : null;
}
function searchSmart(q, filter) {
  const r = search(q, filter);
  if (r.list.length || r.mode === 'vide' || r.mode === 'numéro' || r.mode === 'article') return r;
  const c = correct(q);
  if (c) { const r2 = search(c, filter); if (r2.list.length) { r2.dym = c; r2.q = c; return r2; } }
  return r;
}
function rankScen(q) {
  const toks = tokens(q);
  if (!toks.length) return [];
  const out = [];
  SCEN.forEach(s => {
    if (s.cata || s.dup) return;
    let sc = 0, hit = 0;
    for (const tk of toks) {
      let b = 0;
      for (const a of alts(tk)) {
        const x = altScore(s._t, a), y = altScore(s._k, a);
        b = Math.max(b, x ? (x >= 2 ? 3 : 1) : y ? (y >= 2 ? 2 : 1) : 0);
      }
      if (b) { hit++; sc += b; }
    }
    if (hit && hit >= Math.ceil(toks.length / 2)) out.push([sc * (hit / toks.length), s]);
  });
  out.sort((a, b) => b[0] - a[0]);
  return out.map(x => x[1]);
}

const ROAD_CATS = new Set(['Alcool & stupéfiants', 'Permis & documents', 'Vitesse', 'Comportement', 'Accident', 'Stationnement', 'Immatriculation & équipements', 'Tuning & bruit', 'Exercice & autorisations', 'Documents & contrôles', 'Équipement & signalétique', 'Tarifs & filouterie', 'Poids, dimensions & chargement', 'Licences & transport public', 'Temps de conduite & tachygraphe', 'Matières dangereuses (ADR)', 'Deux-roues motorisés & cycles', 'EDPM']);
const cn = n => n.split('|')[0];
const isRC = n => ROAD_CATS.has(cn(n));
const scenRoad = s => isRC(s.cat);
function rankMem(q) {
  const toks = tokens(q); if (!toks.length) return [];
  const out = [];
  MEM.forEach(m => {
    let sc = 0, hit = 0;
    for (const tk of toks) { let b = 0; for (const a of alts(tk)) b = Math.max(b, altScore(m._t, a)); if (b) { hit++; sc += b; } }
    if (hit && hit >= Math.ceil(toks.length / 2)) out.push([sc * (hit / toks.length), m]);
  });
  out.sort((a, b) => b[0] - a[0]);
  return out.map(x => x[1]);
}

/* ---------- rendu ---------- */
const natClass = k => k <= 4 ? 'nat-c' : (k === 5 || k === 7 || k === 9) ? 'nat-d' : k === 6 ? 'nat-k' : 'nat-o';
const natShort = k => k <= 4 ? 'Contravention ' + (k + 1) + 'e cl.' : NAT[k];
function hl(html, toks) {
  if (!toks || !toks.length) return html;
  let out = html;
  const words = new Set();
  toks.forEach(t => alts(t).forEach(a => a.length >= 2 && words.add(a)));
  const re = new RegExp('(^|[^a-zà-ÿ])(' + [...words].map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'gi');
  return out.replace(re, (m, p, w) => p + '<mark>' + w + '</mark>');
}
function routeArts(r, n = 3) {
  const out = [];
  for (const part of r[F_DEF].trim().split(/(?<=\.)\s+(?=ART\.)/)) {
    if (/C\.ROUTE\.$/.test(part.trim())) {
      for (const m of part.matchAll(/ART\.([LRD]\.\d+(?:-\d+)*)/g)) if (!out.includes(m[1])) out.push(m[1]);
    }
  }
  return out.slice(0, n);
}
function badges(num, r) {
  const e = E[num] || {}, b = [];
  if (e.pts !== undefined && e.pts !== null && e.pts > 0) b.push(`<span class="chip pts">${e.pts} pt${e.pts > 1 ? 's' : ''}</span>`);
  const add = (key, label, strong) => {
    const v = e[key]; if (!v || !v.lvl) return;
    b.push(`<span class="chip ${v.lvl === 'obl' || (strong && v.lvl === 'rec') ? 'red' : 'amb'}">${label}</span>`);
  };
  if (e.confiscation && e.confiscation.lvl) b.push(`<span class="chip ${e.confiscation.lvl === 'obl' ? 'red' : 'amb'}">${e.confiscation.lvl === 'obl' ? 'Confiscation oblig.' : 'Confiscation'}</span>`);
  if (e.volee) b.unshift('<span class="chip volee">À la volée</span>');
  add('retention', 'Rétention');
  add('depistage', 'Dépistage');
  add('immobilisation', 'Immobilisation');
  return b.join('');
}
function card(i, toks, extraClass) {
  const r = ROWS[i], num = r[F_NUM], k = r[F_NAT];
  const arts = routeArts(r);
  return `<button class="card ${natClass(k)} ${extraClass || ''}" data-n="${num}">
    <div class="top"><span class="num">${num}</span><span class="chip ${natClass(k)}">${esc(natShort(k))}</span>${badges(num, r)}</div>
    <div class="lib">${hl(esc(fmt(r[F_LIB])), toks)}</div>
    ${arts.length ? `<div class="arts">${arts.map(esc).join(' · ')}</div>` : ''}
  </button>`;
}
function memCard(m) {
  return `<button class="scard mem" data-m="${m.id}"><span class="ico">${m.icon}</span><b>${esc(m.title)}</b><small>${esc(m.desc)} · ${m.pages.length + 1} pages</small></button>`;
}
function catTiles(road) {
  return `<div class="grid cats">${CATS.map(([name, ico], i) => { if (road !== undefined && isRC(name) !== road) return ''; const n = SCEN.filter(s => s.cat === name).length;
    return n ? `<button class="scard cat" data-cat="${i}"><span class="ico">${ico}</span><b>${esc(cn(name))}</b><small>${n} situation${n > 1 ? 's' : ''}</small></button>` : ''; }).join('')}</div>`;
}
function volBanner() {
  return state.volee ? `<div class="note info" style="margin:8px 0">🚗 Filtre « À la volée » actif : seules les infractions relevables sans interception sont affichées. <button class="btn" style="margin-left:6px" data-volee="0">Désactiver</button></div>` : '';
}
const isVol = n => !!(E[n] && E[n].volee);
const volOn = s => !!(state.volee && (!s || scenRoad(s)));
function scenIds(s) { const ids = s.groups.flatMap(g => g.ids); return volOn(s) ? ids.filter(isVol) : ids; }
function famTiles(road) {
  return `<div class="grid cats">${FAM.map(([name, ico, cats], i) => { if (isRC(cats[0]) !== road) return ''; const n = SCEN.filter(s => cats.includes(s.cat) && scenIds(s).length).length;
    return n ? `<button class="scard cat" data-fam="${i}"><span class="ico">${ico}</span><b>${esc(name)}</b><small>${n} situation${n > 1 ? 's' : ''}</small></button>` : ''; }).join('')}</div>`;
}
function viewFam(i) {
  const f = FAM[i];
  if (!f) return `<button class="back" data-back="1">‹ Retour</button><div class="empty">Famille introuvable.</div>`;
  let h = `<button class="back" data-back="1">‹ Retour</button><h2 style="margin-top:6px">${f[1]} ${esc(f[0])}</h2>` + (isRC(f[2][0]) ? volBanner() : '');
  if (f[2].length > 1) {   // plusieurs sous-catégories : tuiles à ouvrir
    const tiles = f[2].map(c => { const ci = CATS.findIndex(x => x[0] === c); if (ci < 0) return '';
      const n = SCEN.filter(s => s.cat === c && scenIds(s).length).length;
      return n ? `<button class="scard cat" data-cat="${ci}"><span class="ico">${CATS[ci][1]}</span><b>${esc(cn(c))}</b><small>${n} situation${n > 1 ? 's' : ''}</small></button>` : ''; }).join('');
    return h + (tiles ? `<div class="grid cats">${tiles}</div>` : `<div class="empty">Aucune situation ne correspond au filtre.</div>`);
  }
  const ss = SCEN.filter(s => s.cat === f[2][0] && scenIds(s).length);
  return h + (ss.length ? `<div class="grid">${ss.map(s => scenCard(s)).join('')}</div>` : `<div class="empty">Aucune situation ne correspond au filtre.</div>`);
}

/* ---------- assistant de qualification (hors ligne, indicatif) ---------- */
let QRX = null, NUMI = null;
function qualify(q) {
  const Q = D.qual; if (!Q) return [];
  const t = ' ' + norm(q) + ' ';
  if (t.trim().split(' ').length < 3) return [];
  if (!QRX) { QRX = {}; for (const k in Q.faits) { try { QRX[k] = new RegExp(Q.faits[k]); } catch (e) {} } }
  const has = {}; for (const k in QRX) has[k] = QRX[k].test(t);
  let hit = Q.rules.filter(r => r.si.every(f => has[f]) && !r.ex.some(f => has[f]));
  hit = hit.filter(a => !hit.some(b => b !== a && b.si.length > a.si.length && a.si.every(f => b.si.includes(f))));
  return hit.map(r => ({r, sc: r.w * 2 + r.si.length * 2 + r.plus.filter(f => has[f]).length, faits: [...new Set(r.si.concat(r.plus.filter(f => has[f])))]}))
    .sort((a, b) => b.sc - a.sc).slice(0, 3);
}
function qIdx(n) { if (!NUMI) { NUMI = new Map(); ROWS.forEach((r, i) => NUMI.set(r[F_NUM], i)); } return NUMI.get(n); }
function qualHtml(list) {
  if (!list.length) return '';
  const L = D.qual.lab;
  let h = `<h2>Pistes d’après les faits décrits</h2><p class="hint"><span class="tag">Indicatif – à valider</span> Analyse automatique du texte, hors ligne : ce ne sont que des pistes à confronter aux faits réels et aux textes. Elle ne retient aucune qualification.</p>`;
  list.forEach(({r, faits}) => {
    const nat = r.nat.map(qIdx).filter(i => i !== undefined);
    h += `<div class="qual"><b class="qt">${esc(r.titre)}</b><div class="qf">Faits repérés : ${faits.map(f => `<span class="tag">${esc(L[f] || f)}</span>`).join(' ')}</div><p class="qw">${esc(r.why)}</p>`;
    if (nat.length) h += `<div class="list" style="margin:6px 0">${nat.map(i => card(i)).join('')}</div>`;
    if (r.scen.length) h += `<div class="qs">Dossiers : ${r.scen.map(id => { const s = SCEN.find(x => x.id === id); return s ? `<a class="inl" data-s="${s.id}" href="#/s/${s.id}">${esc(s.title)}</a>` : ''; }).filter(Boolean).join(' · ')}</div>`;
    if (r.q.length) h += `<details class="qq"><summary>Circonstances à vérifier (${r.q.length})</summary><ul>${r.q.map(([t, ns]) => `<li>${esc(t)}${ns.map(qIdx).filter(i => i !== undefined).length ? ' ' + ns.map(n => `<a class="inl" data-n="${n}" href="#/n/${n}">${n}</a>`).join(' ') : ''}</li>`).join('')}</ul></details>`;
    h += `</div>`;
  });
  return h;
}
function scenCard(s, big) {
  const n = scenIds(s).length;
  return `<button class="scard ${big ? 'big' : ''}" data-s="${s.id}"><b><span class="sico">${s.ico || ''}</span>${esc(s.title)}</b><small>${esc(cn(s.cat))} · ${n} NATINF</small></button>`;
}

/* ---------- état et vues ---------- */
const state = {volee: !!store.get('volee', false), tab: (t => (t === 'situations' || t === 'infractions') ? 'routier' : t)(store.get('tab', 'routier')), filter: 'tous', q: '', shown: 40};
let lastScroll = 0;
const main = $('#main');

function countOther(q, road) {
  const save = SCOPE; SCOPE = road ? 'gen' : 'route';
  const r = searchSmart(q, 'tous'); SCOPE = save;
  return r.mode === 'numéro' || r.mode === 'article' ? 0 : r.list.length;
}
function viewScope() {
  const road = state.tab !== 'general';
  const q = state.q.trim();
  if (!['tous', 'volee', 'points'].includes(state.filter) || (!road && state.filter !== 'tous')) state.filter = 'tous';
  let html = !road ? '' : `<div class="grid shortcuts"><button class="scard sc ${state.volee ? 'on' : ''}" data-volee="${state.volee ? 0 : 1}"><span class="ico">${state.volee ? '☑' : '☐'}</span><b>À la volée</b><small>${state.volee ? 'filtre actif : relevable sans interception' : 'ne montrer que les infractions relevables sans interception'}</small></button><button class="scard sc ${state.filter === 'points' ? 'on' : ''}" data-filter="${state.filter === 'points' ? 'tous' : 'points'}"><span class="ico">🎯</span><b>Barème des points</b><small>par nombre de points</small></button></div>`;
  const sf = (road && (state.filter === 'volee' || state.volee)) ? 'volee' : 'tous';
  if (!q && state.filter === 'points') {
    const groups = new Map(); const grave = [];
    ROWS.forEach((r, i) => { const e = E[r[F_NUM]]; if (!e || !(e.pts > 0) || r[F_ROAD] !== 1 || (state.volee && !e.volee)) return;
      if (/^(HOMICIDE|BLESSURES)/.test(r[F_LIB])) grave.push(i); else { if (!groups.has(e.pts)) groups.set(e.pts, []); groups.get(e.pts).push(i); } });
    html += volBanner() + `<p class="hint">Infractions routières avec retrait de points, classées par nombre de points. Les retraits peuvent se cumuler dans la limite de 8 points. <span class="tag">Indicatif – à valider</span></p>`;
    [...groups.keys()].sort((x, y) => y - x).forEach(p => {
      html += `<h2>${p} point${p > 1 ? 's' : ''} <small style="font-weight:400">(${groups.get(p).length})</small></h2><div class="list">${groups.get(p).map(i => card(i)).join('')}</div>`; });
    if (grave.length) html += `<h2>Homicides et blessures routières <small style="font-weight:400">(${grave.length})</small></h2><p class="hint">Délits avec retrait de 6 points : voir la fiche de chaque infraction.</p><div class="list">${grave.map(i => card(i)).join('')}</div>`;
    return html;
  }
  if (!q && state.filter === 'volee') {
    const all = []; ROWS.forEach((r, i) => { const v = E[r[F_NUM]] && E[r[F_NUM]].volee; if (v) all.push([v.topic, i]); });
    html += `<p class="hint">Infractions pouvant être relevées <b>sans interception du conducteur</b> (liste R.121-6 du Code de la route, avec redevabilité pécuniaire du titulaire du certificat d'immatriculation – L.121-3). <span class="tag">Indicatif – à valider</span></p>`;
    let cur = '';
    html += `<button class="more" data-filter="tous" style="margin-bottom:10px">‹ Retour aux familles</button>`;
    all.forEach(([t, i]) => { if (t !== cur) { cur = t; html += `<h2>${esc(t)}</h2>`; } html += `<div class="list" style="margin-bottom:6px">${card(i)}</div>`; });
    return html;
  }
  if (!q) {
    html += road
      ? `<p class="hint"><b>Infractions routières.</b> Choisissez une situation de contrôle, ou cherchez par <b>mot</b> (« sans permis », « tuning »), <b>numéro NATINF</b> (« 1247 ») ou <b>article</b> (« L234-1 »). Hors ligne.</p>`
      : `<p class="hint"><b>Infractions générales</b> (hors Code de la route : personnes, biens, stupéfiants, armes, ordre public…). Choisissez une situation, ou cherchez par <b>mot</b> (« baston », « dealer »), <b>numéro NATINF</b> ou <b>article</b> (« 222-13 »). Hors ligne.</p>`;
    html += (road ? volBanner() : '') + `<h2>Situations par famille</h2>` + famTiles(road);
    if (road && state.volee) html += `<button class="more" data-filter="volee">Liste complète par rubrique (R.121-6)</button>`;
    const freq = road ? ['tuning', 'sans permis', 'alcool', 'téléphone', 'ceinture', 'plaque', 'stationnement gênant', "refus d'obtempérer", 'trottinette', 'plaque étrangère']
                      : ['baston', 'dealer', 'vol', 'menaces', 'arme', 'squat', 'tapage', 'outrage', 'protoxyde', 'travail dissimulé', 'débit de boissons'];
    html += `<h2>Recherches fréquentes</h2><div class="grid">${freq.map(x => `<button class="scard" data-ex="${esc(x)}"><b>${esc(x)}</b></button>`).join('')}</div>`;
    return html;
  }
  const res = searchSmart(q, sf);
  const num = res.mode === 'numéro' || res.mode === 'article';
  const sc = num ? [] : rankScen(res.q || q).filter(s => scenRoad(s) === road && scenIds(s).length);
  const mm = num ? [] : rankMem(res.q || q);
  const other = num ? 0 : countOther(res.q || q, road);
  const otherBtn = other ? `<button class="more" data-scope="${road ? 'general' : 'routier'}">${other.toLocaleString('fr-FR')} résultat${other > 1 ? 's' : ''} aussi dans « ${road ? 'Général' : 'Routier'} »</button>` : '';
  if (res.dym) html += `<p class="hint">Résultats pour « <b>${esc(res.dym)}</b> » (vous avez tapé « ${esc(q)} »)</p>`;
  const ql = num ? [] : qualify(q);
  html += qualHtml(ql);
  if (sc.length) html += `<h2>Situations correspondantes</h2><div class="list" style="margin-bottom:12px">${sc.slice(0, 4).map(s => scenCard(s, true)).join('')}</div>`;
  if (mm.length) html += `<h2>Mementos</h2><div class="list" style="margin-bottom:12px">${mm.slice(0, 3).map(memCard).join('')}</div>`;
  if (!res.list.length) {
    if (!sc.length && !mm.length && !ql.length) html += `<div class="empty">Aucun NATINF trouvé pour « ${esc(q)} »${sf !== 'tous' ? ' avec ce filtre' : ''} dans « ${road ? 'Routier' : 'Général'} ».</div>`;
    return html + otherBtn;
  }
  html += `<h2>Infractions${res.mode === 'approchant' ? ' (approchant)' : ''}</h2><p class="hint">${res.list.length.toLocaleString('fr-FR')} résultat${res.list.length > 1 ? 's' : ''}${res.mode === 'article' ? ' pour cet article' : ''}</p>`;
  html += `<div class="list">${res.list.slice(0, state.shown).map(i => card(i, res.toks)).join('')}</div>`;
  if (res.list.length > state.shown) html += `<button class="more" data-more="1">Afficher plus (${res.list.length - state.shown} restants)</button>`;
  return html + otherBtn;
}
function viewMementos() {
  const q = state.q.trim();
  const list = q ? rankMem(q) : MEM;
  let html = `<p class="hint">Fiches de référence : seuils, procédure, mesures, sanctions, avec sources officielles. <span class="tag">Indicatif – à valider</span></p>`;
  if (!list.length) return html + `<div class="empty">Aucun memento pour « ${esc(q)} ».</div>`;
  return html + `<div class="grid">${list.map(memCard).join('')}</div>`;
}
let memPage = -1;
const cellCls = t => /^(OBLIGATOIRE|DÉLIT|DOIT)/.test(t) ? ' class="hot"' : /^(Facultative|PEUT)/.test(t) ? ' class="warm"' : '';
function renderBlock(b) {
  switch (b.t) {
    case 'table':
      return `<div class="tbl"><table><thead><tr>${b.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${b.rows.map(r =>
        `<tr>${r.map((c, i) => `<td${cellCls(c)}${i === 0 ? ' data-first="1"' : ''} data-l="${esc(b.head[i])}">${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    case 'kv':
      return `<div class="kv">${b.rows.map(([k, v, lv]) => `<div class="kvr ${lv}"><div class="k">${esc(k)}</div><div class="v">${lv === 'obl' ? '<b class="pill red">À FAIRE</b>' : lv === 'fac' ? '<b class="pill amb">POSSIBLE</b>' : ''}${esc(v)}</div></div>`).join('')}</div>`;
    case 'list':
      return `<ul class="mlist">${b.items.map(([lv, t]) => `<li class="${lv}">${lv === 'obl' ? '<b class="pill red">À FAIRE</b>' : lv === 'fac' ? '<b class="pill amb">POSSIBLE</b>' : ''}${esc(t)}</li>`).join('')}</ul>`;
    case 'flow':
      return `<ol class="flow">${b.steps.map(([t, d]) => `<li><b>${esc(t)}</b><span>${esc(d)}</span></li>`).join('')}</ol>`;
    case 'note':
      return `<div class="note ${b.kind}">${b.kind === 'warn' ? '⚠️ ' : 'ℹ️ '}${esc(b.text)}</div>`;
    case 'refs':
      return `<div class="refs">${b.arts.map(a => `<span class="ref">${esc(a)}</span>`).join('')}</div>`;
  }
  return '';
}
function viewMemento(id) {
  const m = MEM_BY.get(id);
  if (!m) return `<button class="back" data-back="1">‹ Retour</button><div class="empty">Memento introuvable.</div>`;
  const n = m.pages.length, total = n + 1;                 // -1 sommaire ; 0..n-1 pages ; n liens
  memPage = Math.max(-1, Math.min(n, memPage));
  let h = `<button class="back" data-back="1">‹ Retour</button><div class="mhead"><span class="ico">${m.icon}</span><div><div class="mtitle">${esc(m.title)}</div><div class="mcount">${esc(m.ref)} · sources vérifiées le ${esc(m.verif)}${memPage >= 0 ? ' · page ' + (memPage + 1) + ' / ' + total : ''}</div></div></div>`;
  if (memPage === -1) {
    h += `<div class="banner">Fiche rédigée d'après des sources officielles ; les textes évoluent. <b>Indicatif – à valider</b> avant usage opérationnel.</div>
      <h2>Sommaire</h2><div class="sommaire">${m.pages.map((p, i) => `<button class="som" data-mg="${i}"><span class="n">${i + 1}</span>${esc(p.title)}</button>`).join('')}<button class="som" data-mg="${n}"><span class="n">${total}</span>NATINF et situations liés</button></div>
      <h2>Sources</h2><div class="box src-list">${m.sources.map(([l, u]) => `<div><a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(l)}</a></div>`).join('')}</div>`;
  } else if (memPage < n) {
    const p = m.pages[memPage];
    h += `<div class="mpage"><h3>${esc(p.title)}</h3>${p.blocks.map(renderBlock).join('')}</div>`;
  } else {
    h += `<div class="mpage"><h3>Infractions liées</h3></div><div class="list" style="margin-top:10px">${m.natinf.filter(x => IDX.has(x)).map(x => card(IDX.get(x))).join('')}</div>`;
    if (m.scen.length) h += `<h2>Situations</h2><div class="grid">${m.scen.filter(x => SCEN_BY.has(x)).map(x => scenCard(SCEN_BY.get(x))).join('')}</div>`;
    h += `<p class="legal">Fiche indicative établie d'après les sources citées au sommaire ; vérifier les textes en vigueur (Légifrance) avant toute décision.</p>`;
  }
  h += `<div class="mnav"><button class="btn" data-mp="-1" ${memPage <= 0 ? 'disabled' : ''}>‹ Préc.</button><button class="btn" data-mg="-1" ${memPage === -1 ? 'disabled' : ''}>☰</button><button class="btn primary" data-mp="1" ${memPage >= n ? 'disabled' : ''}>Suiv. ›</button></div>`;
  return h;
}
function viewFavoris() {
  const fav = store.get('fav', []);
  if (!fav.length) return `<div class="empty">Aucun favori.<br>Ouvrez une fiche et touchez ☆ pour la garder à portée de main.</div>`;
  return `<div class="list">${fav.filter(n => IDX.has(n)).map(n => card(IDX.get(n))).join('')}</div>`;
}
function renderList() {
  if (state.tab === 'situations' || state.tab === 'infractions') state.tab = 'routier';
  SCOPE = state.tab === 'general' ? 'gen' : state.tab === 'routier' ? 'route' : null;
  const fn = (state.tab === 'routier' || state.tab === 'general') ? viewScope : state.tab === 'mementos' ? viewMementos : viewFavoris;
  main.innerHTML = fn();
  document.querySelectorAll('#tabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === state.tab ? 'true' : 'false'));
  $('#tabs').hidden = false;
}

/* ----- détail d'une infraction ----- */
function tile(k, v, lvl, wide) {
  const cls = lvl === 'obl' ? 'red' : (lvl === 'fac' || lvl === 'rec') ? 'amb' : '';
  return `<div class="tile ${cls} ${wide ? 'wide' : ''}"><div class="k">${k}</div><div class="v">${v}</div></div>`;
}
const LVL = {obl: 'OBLIGATOIRE – ', rec: 'EN RÉCIDIVE – ', fac: 'POSSIBLE – '};
let GL = [];
function artBlock(s) {
  if (!s.trim()) return '<div>—</div>';
  return s.trim().split(/(?<=\.)\s+(?=ART\.)/).map(g => {
    let body = g.replace(/ART\./g, ''), tail = '';
    for (const [mn, lib, kind, re] of GL) {
      if (re.test(body)) {
        if (kind === 'code') { body = body.replace(re, '$1').replace(/[\s.]+$/, '').trim(); tail = ' — ' + lib; }
        else body = body.replace(re, '$1' + lib);
        break;
      }
    }
    return `<div>${esc(body + tail)}</div>`;
  }).join('');
}
function viewDetail(num) {
  if (!IDX.has(num)) return `<button class="back" data-back="1">‹ Retour</button><div class="empty">NATINF ${esc(num)} introuvable.</div>`;
  const i = IDX.get(num), r = ROWS[i], k = r[F_NAT], e = E[num] || {};
  const fav = store.get('fav', []).includes(num);
  let h = `<button class="back" data-back="1">‹ Retour</button>
  <div class="dhead"><span class="dnum">${num}</span><span class="chip ${natClass(k)}">${esc(NAT[k])}</span>${r[F_ROAD] ? '<span class="chip nat-o">Code de la route</span>' : ''}</div>
  <div class="dlib">${esc(fmt(r[F_LIB]))}</div>
  <div class="actions"><button class="btn primary" data-copy="${num}">Copier NATINF + libellé</button><button class="btn" data-fav="${num}" aria-label="Favori"><span class="star">${fav ? '★' : '☆'}</span></button></div>`;

  // Mesures
  const t = [];
  const road = r[F_ROAD] === 1;
  if (e.volee) {
    const v = e.volee, it = String(v.item || '').replace('BIS', 'bis').replace('TER', 'ter');
    t.push(`<div class="tile volee wide"><div class="k">Constatable à la volée</div><div class="v">Peut être relevée <b style="font-size:inherit">sans interception du conducteur</b> (R.121-6${it ? ' ' + esc(it) : ''}, rubrique « ${esc(v.topic)} »). Conducteur non identifié : le titulaire du certificat d'immatriculation est redevable pécuniairement de l'amende (L.121-3)${v.red && v.red.length ? ' – NATINF « redevable » : ' + v.red.filter(x => IDX.has(x)).map(x => `<button class="chip volee" data-n="${x}">${x}</button>`).join(' ') : ''}.<br><small>Relever : plaque, lieu, date et heure, nature précise de l'infraction, éléments de preuve.</small></div></div>`);
  }
  if (e.pts !== undefined) t.push(tile('Retrait de points', e.pts === null ? 'Non renseigné – voir barème' : (e.pts === 0 ? '<b>Aucun</b> retrait' : `<b>${e.pts}</b> point${e.pts > 1 ? 's' : ''}`), e.pts >= 6 ? 'obl' : e.pts >= 3 ? 'fac' : null));
  else if (road && (k <= 5)) t.push(tile('Retrait de points', 'Non renseigné dans cette version – voir barème officiel', null));
  if (k <= 4) t.push(tile('Amende', `Max ${AMAX[k]}${road && k <= 3 ? `<br>Forfaitaire courante : ${esc(e.forfait || FORF[k])}` : ''}`, null, false));
  if (e.peine) t.push(tile('Peine encourue', esc(e.peine), null, true));
  [['retention', 'Rétention du permis'], ['suspension', 'Suspension'], ['depistage', 'Dépistage / vérification'], ['confiscation', 'Confiscation du véhicule'], ['immobilisation', 'Immobilisation']]
    .forEach(([key, label]) => { const v = e[key]; if (v) t.push(tile(label, (v.lvl ? `<b style="font-size:13px">${LVL[v.lvl]}</b>` : '') + esc(v.txt), v.lvl, true)); });
  if (t.length) h += `<h2>Mesures et barème <span class="tag">Indicatif – à valider</span></h2><div class="tiles">${t.join('')}</div>`;
  else if (road) h += `<h2>Mesures et barème</h2><div class="box">Points, rétention, confiscation et dépistage ne sont pas encore renseignés pour cette infraction : se référer aux articles ci-dessous.</div>`;
  if (e.circ) h += `<div class="box circ"><h3>${esc(e.circ.title)} <span class="tag">Indicatif – à valider</span></h3><p style="margin:6px 0">${esc(e.circ.intro)}</p><ul>${e.circ.items.map(x => `<li>${esc(x)}</li>`).join('')}</ul><p style="margin:8px 0 4px">${esc(e.circ.outro)}</p><div class="note info">À consigner : ${esc(e.circ.todo)}</div><p class="src" style="margin:8px 0 0">${esc(e.circ.src)}</p></div>`;
  if (e.notes && e.notes.length) h += `<div class="box"><h3>À savoir</h3><ul>${e.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul></div>`;

  // Articles
  h += `<h2>Textes <span class="src">source : NATINF officiel</span></h2><div class="box art"><b>Définie par</b>${artBlock(r[F_DEF])}<b>Réprimée par (peines)</b>${artBlock(r[F_REP])}</div>`;
  h += `<div class="box"><h3>Libellé officiel NATINF</h3><div class="art">${esc(r[F_LIB])}</div></div>`;

  // Voisines
  if (r[F_PRIM] && PRIM.has(r[F_PRIM])) {
    const sib = PRIM.get(r[F_PRIM]).filter(j => j !== i).slice(0, 8);
    if (sib.length) h += `<h2>Voir aussi (même article ${esc(r[F_PRIM])})</h2><div class="list">${sib.map(j => card(j)).join('')}</div>`;
  }
  // Scénarios liés
  const sl = SCEN.filter(s => !s.dup && s.groups.some(g => g.ids.includes(num)));
  if (sl.length) h += `<h2>Situations liées</h2><div class="list">${sl.map(s => scenCard(s, true)).join('')}</div>`;
  h += `<p class="legal">Aide à la qualification, <b>non opposable</b>. Vérifier systématiquement les textes en vigueur (Légifrance) avant de rédiger une procédure. Base NATINF : édition ${esc(D.meta.edition)}.</p>`;
  return h;
}
function viewCat(i) {
  const c = CATS[i];
  if (!c) return `<button class="back" data-back="1">‹ Retour</button><div class="empty">Catégorie introuvable.</div>`;
  const ss = SCEN.filter(s => s.cat === c[0] && scenIds(s).length);
  return `<button class="back" data-back="1">‹ Retour</button><h2 style="margin-top:6px">${c[1]} ${esc(cn(c[0]))}</h2>${isRC(c[0]) ? volBanner() : ''}` +
    (ss.length ? `<div class="grid">${ss.map(s => scenCard(s)).join('')}</div>` : `<div class="empty">Aucune situation ne correspond au filtre.</div>`);
}
function viewScenario(id) {
  const s = SCEN_BY.get(id);
  if (!s) return `<button class="back" data-back="1">‹ Retour</button><div class="empty">Situation introuvable.</div>`;
  let h = `<button class="back" data-back="1">‹ Retour</button><div class="chip nat-o">${esc(cn(s.cat))}</div>
  <div class="dlib" style="margin-top:8px">${s.ico ? s.ico + ' ' : ''}${esc(s.title)}</div><p class="hint" style="margin-top:-6px">${esc(s.desc)}</p>`;
  const mems = (s.mem || []).filter(x => MEM_BY.has(x));
  const chk = c => { let t = esc(c); if (mems.length && /memento « Identifier une arme »/.test(c)) t = t.replace('memento « Identifier une arme »', `<a class="inl" href="#/m/${mems[0]}">memento « Identifier une arme »</a>`); return `<li>${t}</li>`; };
  if (s.check && s.check.length) h += `<div class="box"><h3>À vérifier / à faire <span class="tag">Indicatif – à valider</span></h3><ul>${s.check.map(chk).join('')}</ul></div>`;
  if (mems.length) h += `<div class="memrow">${mems.map(x => `<a class="memlink" href="#/m/${x}">📖 Memento : ${esc(MEM_BY.get(x).title)}</a>`).join('')}</div>`;
  const label = {principal: 'Infractions à retenir', associee: 'Infractions souvent associées', aggravante: 'Cas aggravés'};
  if (scenRoad(s)) h += volBanner();
  s.groups.forEach(g => {
    const ids = volOn(s) ? g.ids.filter(isVol) : g.ids;
    if (!ids.length) return;
    const cards = ids.filter(n => IDX.has(n)).map(n => card(IDX.get(n))).join('');
    if (g.role === 'dossier') h += `<details class="vgrp"><summary>📁 ${esc(g.title)} <span class="vn">${ids.length}</span></summary><div class="list">${cards}</div></details>`;
    else if (g.title.startsWith('Variantes')) h += `<details class="vgrp"><summary>${esc(g.title.replace(/^Variantes : /, 'Variantes et cas aggravés · '))} <span class="vn">${ids.length}</span></summary><div class="list">${cards}</div></details>`;
    else h += `<h2>${esc(g.title)}</h2><div class="list">${cards}</div>`;
  });
  if (volOn(s) && !scenIds(s).length) h += `<div class="empty">Aucune infraction de cette situation n'est relevable à la volée.</div>`;
  if (s.q) h += `<button class="more" data-sq="${esc(s.q)}">Voir toutes les infractions « ${esc(s.q)} »</button>`;
  h += `<p class="legal">Sélection d'aide à la qualification : elle ne remplace ni l'analyse des faits ni la vérification des textes. Pour une qualification précise, utilisez aussi la recherche par mot, numéro ou article.</p>`;
  return h;
}
function viewAbout() {
  return `<button class="back" data-back="1">‹ Retour</button>
  <div class="dlib">À propos et limites</div>
  <div class="box"><h3>Version</h3><b>NATINFLEX 1.0</b> – données NATINF édition ${esc(D.meta.edition)}</div>
  <div class="box"><h3>Source des données</h3>Nomenclature NATINF « Liste des infractions en vigueur » – Ministère de la Justice (data.gouv.fr), <b>Licence Ouverte 2.0</b>. Édition ${esc(D.meta.edition)} : <b>${D.meta.count.toLocaleString('fr-FR')}</b> infractions. Numéro, nature, libellé et articles viennent tels quels de ce fichier.</div>
  <div class="box"><h3>Ce qui n'est pas dans le fichier officiel</h3>Les <b>points</b>, la <b>rétention</b>, la <b>suspension</b>, la <b>confiscation</b>, le <b>dépistage</b>, l'<b>immobilisation</b>, les <b>peines</b> des principaux délits et les listes de « à vérifier » ont été ajoutés pour faciliter le travail. Ils sont signalés <span class="tag">Indicatif – à valider</span> : ils doivent être relus et validés par une personne compétente avant tout usage opérationnel.</div>
  <div class="box"><h3>Utilisation</h3><ul>
  <li><b>Routier</b> : infractions du Code de la route ; décrivez les faits ou choisissez une situation par catégorie.</li>
  <li><b>Général</b> : tout ce qui n'est pas routier (personnes, biens, stupéfiants, armes, ordre public…).</li>
  <li><b>Recherche</b> : par mot, numéro NATINF (ex. 1247) ou article (ex. L234-1) ; les numéros et articles sont cherchés dans tout le fichier, quel que soit l'onglet.</li>
  <li>Fonctionne <b>hors ligne</b> une fois la page chargée et installée sur l'écran d'accueil.</li></ul></div>
  <div class="box"><h3>Avertissement</h3>Outil d'aide à la qualification, <b>non officiel</b>, qui n'a aucune valeur juridique. Les textes évoluent : vérifiez toujours sur Légifrance. Aucune donnée saisie n'est envoyée : la recherche se fait sur votre appareil.</div>
  <div class="box"><h3>Thème</h3><button class="btn" data-theme="auto">Auto</button> <button class="btn" data-theme="light">Clair</button> <button class="btn" data-theme="dark">Sombre</button></div>`;
}

/* ---------- routeur ---------- */
function stampNav() {   // numérote chaque entrée d'historique de l'application (0 = première page ouverte)
  try {
    const st = history.state;
    if (st && typeof st.i === 'number') window.__i = st.i;
    else { window.__i = window.__started ? (window.__i || 0) + 1 : 0; history.replaceState(Object.assign({}, st || {}, { i: window.__i }), '', location.href); }
    window.__started = true;
  } catch (_) { window.__i = window.__started ? (window.__i || 0) + 1 : 0; window.__started = true; }
}
function route() {
  stampNav();
  const h = location.hash || '#/';
  if (!/^#\/m\//.test(h)) window.__memPush = 0;
  let m;
  const top = $('#tabs');
  if ((m = h.match(/^#\/n\/(\d+)/))) { top.hidden = true; main.innerHTML = viewDetail(parseInt(m[1], 10)); window.scrollTo(0, 0); document.title = 'NATINF ' + m[1]; }
  else if ((m = h.match(/^#\/s\/([\w-]+)/))) { top.hidden = true; main.innerHTML = viewScenario(m[1]); window.scrollTo(0, 0); }
  else if ((m = h.match(/^#\/m\/([\w-]+)/))) { top.hidden = true; window.__memPush = 0; main.innerHTML = viewMemento(m[1]); window.scrollTo(0, 0); try { history.replaceState({ mp: memPage, i: window.__i }, '', location.href); } catch (_) {} }
  else if ((m = h.match(/^#\/f\/(\d+)/))) { top.hidden = true; main.innerHTML = viewFam(parseInt(m[1], 10)); window.scrollTo(0, 0); }
  else if ((m = h.match(/^#\/c\/(\d+)/))) { top.hidden = true; main.innerHTML = viewCat(parseInt(m[1], 10)); window.scrollTo(0, 0); }
  else if (h.startsWith('#/about')) { top.hidden = true; main.innerHTML = viewAbout(); window.scrollTo(0, 0); }
  else { document.title = 'NATINFLEX'; renderList(); window.scrollTo(0, lastScroll); }
}
function go(hash) { if (/^#\/(n|s|c|f|m|about)/.test(hash)) lastScroll = window.scrollY; location.hash = hash; }
window.addEventListener('hashchange', route);

/* ---------- événements ---------- */
let timer;
const qEl = $('#q'), clr = $('#clear');
qEl.addEventListener('input', () => {
  clr.hidden = !qEl.value;
  clearTimeout(timer);
  timer = setTimeout(() => {
    state.q = qEl.value; state.shown = 40; lastScroll = 0;
    if (location.hash && location.hash !== '#/') { location.hash = '#/'; } else renderList();
  }, 140);
});
qEl.addEventListener('keydown', e => { if (e.key === 'Enter') qEl.blur(); });
clr.addEventListener('click', () => { qEl.value = ''; state.q = ''; clr.hidden = true; qEl.focus(); if (location.hash !== '#/' && location.hash) location.hash = '#/'; else renderList(); });
$('#tabs').addEventListener('click', e => {
  const b = e.target.closest('button[data-tab]'); if (!b) return;
  state.tab = b.dataset.tab; store.set('tab', state.tab); state.shown = 40; lastScroll = 0; renderList(); window.scrollTo(0, 0);
});
/* balayage horizontal : changer d'onglet (Routier ⇄ Général ⇄ Mementos ⇄ ★) */
(() => {
  let t0 = null;
  const ORDER = ['routier', 'general', 'mementos', 'favoris'];
  document.addEventListener('touchstart', e => {
    const tg = e.target;
    t0 = (e.touches.length === 1 && !(tg.closest && tg.closest('input,textarea,.tbl,table,pre,[data-noswipe]'))) ? {x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now()} : null;
  }, {passive: true});
  document.addEventListener('touchend', e => {
    if (!t0) return; const t = e.changedTouches[0], dx = t.clientX - t0.x, dy = t.clientY - t0.y, dt = Date.now() - t0.t; t0 = null;
    if ($('#tabs').hidden || (location.hash && location.hash !== '#/')) return;
    if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.8 || dt > 700) return;
    const tabs = [...document.querySelectorAll('#tabs button[data-tab]')].map(b => b.dataset.tab);
    const order = tabs.length ? tabs : ORDER;
    const i = order.indexOf(state.tab), j = i + (dx < 0 ? 1 : -1);
    if (i < 0 || j < 0 || j >= order.length) return;
    state.tab = order[j]; store.set('tab', state.tab); state.shown = 40; lastScroll = 0; renderList(); window.scrollTo(0, 0);
  }, {passive: true});
})();
$('#btnAbout').addEventListener('click', () => go('#/about'));
$('#title').addEventListener('click', () => { if (location.hash !== '#/') location.hash = '#/'; });
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('on'), 1800); }
function applyTheme(t) { if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t); store.set('theme', t); }
main.addEventListener('click', e => {
  const t = e.target.closest('[data-n],[data-s],[data-m],[data-mp],[data-mg],[data-cat],[data-fam],[data-sq],[data-back],[data-go],[data-filter],[data-ex],[data-more],[data-copy],[data-fav],[data-theme],[data-scope],[data-volee]');
  if (!t) return;
  const d = t.dataset;
  if (d.m) { memPage = -1; go('#/m/' + d.m); }
  else if (d.mp || d.mg) { const id = (location.hash.match(/^#\/m\/([\w-]+)/) || [])[1]; if (id && MEM_BY.has(id)) { memPage = d.mg !== undefined ? parseInt(d.mg, 10) : Math.max(0, memPage + parseInt(d.mp, 10)); main.innerHTML = viewMemento(id); window.scrollTo(0, 0); try { history.pushState({ mp: memPage, i: window.__i }, '', location.href); window.__memPush = (window.__memPush || 0) + 1; } catch (_) {} } }
  else if (d.n) go('#/n/' + d.n);
  else if (d.s) go('#/s/' + d.s);
  else if (d.cat) go('#/c/' + d.cat);
  else if (d.fam) go('#/f/' + d.fam);
  else if (d.sq) { const sid = (location.hash.match(/^#\/s\/([\w-]+)/) || [])[1], sn = sid && SCEN_BY.get(sid); state.tab = sn && !scenRoad(sn) ? 'general' : 'routier'; store.set('tab', state.tab); state.filter = 'tous'; state.q = d.sq; qEl.value = d.sq; clr.hidden = false; state.shown = 40; lastScroll = 0; go('#/'); }
  else if (d.back) { const now = Date.now(); if (now - (window.__backT || 0) < 450) return; window.__backT = now; if ((window.__i || 0) > 0) history.go(-1 - (window.__memPush || 0)); else if ((location.hash || '#/') !== '#/') location.hash = '#/'; }
  else if (d.go) { state.tab = d.go; store.set('tab', state.tab); renderList(); window.scrollTo(0, 0); }
  else if (d.volee !== undefined) { state.volee = d.volee === '1'; store.set('volee', state.volee); state.filter = 'tous'; route(); }
  else if (d.scope) { state.tab = d.scope; store.set('tab', state.tab); state.shown = 40; renderList(); window.scrollTo(0, 0); }
  else if (d.filter) { state.filter = d.filter; state.shown = 40; renderList(); }
  else if (d.ex) { qEl.value = d.ex; state.q = d.ex; clr.hidden = false; renderList(); window.scrollTo(0, 0); }
  else if (d.more) { state.shown += 60; renderList(); }
  else if (d.copy) {
    const n = parseInt(d.copy, 10), r = ROWS[IDX.get(n)];
    const txt = 'NATINF ' + n + ' – ' + fmt(r[F_LIB]);
    const ok = () => toast('Copié : NATINF ' + n);
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, () => toast('Copie impossible'));
    else { const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); ok(); } catch (x) { toast('Copie impossible'); } ta.remove(); }
  }
  else if (d.fav) {
    const n = parseInt(d.fav, 10); let fav = store.get('fav', []);
    fav = fav.includes(n) ? fav.filter(x => x !== n) : [n, ...fav];
    store.set('fav', fav); t.querySelector('.star').textContent = fav.includes(n) ? '★' : '☆';
    toast(fav.includes(n) ? 'Ajouté aux favoris' : 'Retiré des favoris');
  }
  else if (d.theme) applyTheme(d.theme);
});
window.addEventListener('popstate', e => { const id = (location.hash.match(/^#\/m\/([\w-]+)/) || [])[1]; if (id && MEM_BY.has(id) && e.state && typeof e.state.mp === 'number') { window.__memPush = Math.max(0, (window.__memPush || 0) - 1); memPage = e.state.mp; main.innerHTML = viewMemento(id); window.scrollTo(0, 0); } });

/* ---------- démarrage ---------- */
function start(data) {
  D = data; GL = Object.entries(D.glossaire || {}).sort((a, b) => b[0].length - a[0].length).map(([mn, v]) => [mn, v[0], v[1], new RegExp('(^|\\s)' + mn.replace(/[.&]/g, '\\$&') + '(?=[\\s.]|$)')]); MEM = D.mem || []; MEM.forEach(m => { MEM_BY.set(m.id, m); m._t = ' ' + norm(m.title + ' ' + m.kw + ' ' + m.desc) + ' '; }); ROWS = D.rows; NAT = D.nature; initSyn(D.syn); CATS = D.cats || []; FAM = D.fam || []; E = D.enrich; SCEN = D.scen;
  buildIndex();
  const th = store.get('theme', 'auto'); if (th !== 'auto') applyTheme(th);
  $('#loading').hidden = true;
  route();
  if (location.search.includes('q=')) { const p = new URLSearchParams(location.search).get('q'); if (p) { qEl.value = p; state.q = p; clr.hidden = false; renderList(); } }
}
if (window.__DATA__) start(window.__DATA__);
else fetch('data.json').then(r => r.json()).then(start).catch(() => { $('#loading').textContent = 'Impossible de charger la base. Vérifiez la connexion pour le premier chargement.'; });
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  const had = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js', {updateViaCache: 'none'}).then(r => r.update().catch(() => {})).catch(() => {});
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (had && !reloaded && !/^#\/m\//.test(location.hash)) { reloaded = true; location.reload(); } });
}
window.__natinf = {search: searchSmart, rankScen, fmt, tokens, row: i => ROWS[i]};   // aide au test
})();
