import type { Article, Category, Profile } from '@/types/database';

export const DEMO_USER_CONTRIBUTOR_ID = '00000000-0000-0000-0000-000000000001';
export const DEMO_USER_ADMIN_ID = '00000000-0000-0000-0000-000000000002';

const CAT_RIGHTS = '10000000-0000-0000-0000-000000000001';
const CAT_SERVICES = '10000000-0000-0000-0000-000000000002';
const CAT_ELECTIONS = '10000000-0000-0000-0000-000000000003';
const CAT_WORK = '10000000-0000-0000-0000-000000000004';
const CAT_LAND = '10000000-0000-0000-0000-000000000005';

const now = new Date();
function daysAgo(n: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const DEMO_PROFILES: Profile[] = [
  {
    id: DEMO_USER_CONTRIBUTOR_ID,
    username: 'aline.editor',
    full_name: 'Aline Uwase',
    avatar_url: null,
    bio: 'Civic reporter covering rights and public services.',
    role: 'contributor',
    preferred_language: 'en',
    account_status: 'active',
    email_notifications: false,
    onboarding_completed_at: daysAgo(60),
    created_at: daysAgo(60),
    updated_at: daysAgo(60),
  },
  {
    id: DEMO_USER_ADMIN_ID,
    username: 'juza.admin',
    full_name: 'Juza Editors',
    avatar_url: null,
    bio: 'Juza editorial team.',
    role: 'admin',
    preferred_language: 'en',
    account_status: 'active',
    email_notifications: false,
    onboarding_completed_at: daysAgo(90),
    created_at: daysAgo(90),
    updated_at: daysAgo(90),
  },
];

export const DEMO_CATEGORIES: Category[] = [
  {
    id: CAT_RIGHTS,
    slug: 'rights-and-freedoms',
    name_en: 'Rights & Freedoms',
    name_fr: 'Droits et libertés',
    name_rw: 'Uburenganzira n’ubwisanzure',
    description_en: 'Constitution, courts, protections.',
    description_fr: 'Constitution, tribunaux, protections.',
    description_rw: 'Itegeko-Nshinga, inkiko, kurindwa.',
    icon: 'scale',
    sort_order: 10,
    created_at: daysAgo(90),
    updated_at: daysAgo(90),
  },
  {
    id: CAT_SERVICES,
    slug: 'public-services',
    name_en: 'Public Services',
    name_fr: 'Services publics',
    name_rw: 'Serivisi rusange',
    description_en: 'IDs, health, education, water.',
    description_fr: 'Papiers, santé, éducation, eau.',
    description_rw: 'Indangamuntu, ubuzima, uburezi, amazi.',
    icon: 'building-2',
    sort_order: 20,
    created_at: daysAgo(90),
    updated_at: daysAgo(90),
  },
  {
    id: CAT_ELECTIONS,
    slug: 'elections-and-governance',
    name_en: 'Elections & Governance',
    name_fr: 'Élections et gouvernance',
    name_rw: 'Amatora n’imiyoborere',
    description_en: 'How decisions get made.',
    description_fr: 'Comment se prennent les décisions.',
    description_rw: 'Uko ibyemezo bifatwa.',
    icon: 'vote',
    sort_order: 30,
    created_at: daysAgo(90),
    updated_at: daysAgo(90),
  },
  {
    id: CAT_WORK,
    slug: 'work-and-money',
    name_en: 'Work & Money',
    name_fr: 'Travail et argent',
    name_rw: 'Akazi n’amafaranga',
    description_en: 'Jobs, taxes, benefits, small business.',
    description_fr: 'Emploi, impôts, aides, petite entreprise.',
    description_rw: 'Akazi, imisoro, inkunga, ubucuruzi buto.',
    icon: 'briefcase',
    sort_order: 40,
    created_at: daysAgo(90),
    updated_at: daysAgo(90),
  },
  {
    id: CAT_LAND,
    slug: 'land-and-housing',
    name_en: 'Land & Housing',
    name_fr: 'Terre et logement',
    name_rw: 'Ubutaka n’amazu',
    description_en: 'Titles, disputes, rent, planning.',
    description_fr: 'Titres, litiges, loyer, urbanisme.',
    description_rw: 'Impapuro z’ubutaka, amakimbirane, ubukode, imitunganyirize.',
    icon: 'home',
    sort_order: 50,
    created_at: daysAgo(90),
    updated_at: daysAgo(90),
  },
];

function makeGroup() {
  return crypto.randomUUID();
}

const groupID = makeGroup();
const groupRA = makeGroup();
const groupSE = makeGroup();
const groupMW = makeGroup();
const groupLT = makeGroup();

let idCounter = 1;
function articleId(): string {
  const n = String(idCounter++).padStart(12, '0');
  return `20000000-0000-0000-0000-${n}`;
}

export const DEMO_ARTICLES: Article[] = [
  // National ID
  {
    id: articleId(),
    translation_group_id: groupID,
    language: 'en',
    slug: 'how-to-get-a-national-id',
    title: 'How to get a national ID',
    excerpt:
      'A step-by-step guide to applying for your national identity card and what documents you need.',
    body:
      "A national ID is the main document that proves who you are for services like banking, voting, and school enrolment.\n\nTo apply, visit your sector office with the following: a birth certificate or family record, a recent passport-size photo, and proof of residence.\n\nProcessing usually takes two to four weeks. If you lose your ID, report it at your local police station and request a replacement at the same office.",
    category_id: CAT_SERVICES,
    author_id: DEMO_USER_CONTRIBUTOR_ID,
    status: 'published',
    review_note: null,
    published_at: daysAgo(3),
    created_at: daysAgo(5),
    updated_at: daysAgo(3),
  },
  {
    id: articleId(),
    translation_group_id: groupID,
    language: 'fr',
    slug: 'comment-obtenir-une-carte-d-identite',
    title: 'Comment obtenir une carte d’identité',
    excerpt:
      'Un guide pas à pas pour demander votre carte d’identité et les documents nécessaires.',
    body:
      "La carte d’identité est le document principal qui prouve votre identité pour des services comme la banque, le vote et l’inscription à l’école.\n\nPour en faire la demande, rendez-vous au bureau de votre secteur avec : un acte de naissance ou un livret de famille, une photo d’identité récente et un justificatif de domicile.\n\nLe traitement prend généralement de deux à quatre semaines. Si vous perdez votre carte, signalez-le au poste de police local et demandez un duplicata au même bureau.",
    category_id: CAT_SERVICES,
    author_id: DEMO_USER_CONTRIBUTOR_ID,
    status: 'published',
    review_note: null,
    published_at: daysAgo(3),
    created_at: daysAgo(5),
    updated_at: daysAgo(3),
  },
  {
    id: articleId(),
    translation_group_id: groupID,
    language: 'rw',
    slug: 'uburyo-bwo-kubona-indangamuntu',
    title: 'Uburyo bwo kubona indangamuntu',
    excerpt: 'Uburyo bwo gusaba indangamuntu n’inyandiko zisabwa.',
    body:
      'Indangamuntu ni yo nyandiko y’ibanze igaragaza umuntu uwo ari we mu bikorwa nk’amabanki, gutora, no kwiyandikisha ku ishuri.\n\nKugira ngo uyisabe, jya ku biro by’umurenge ufite: icyangombwa cy’amavuko cyangwa igitabo cy’umuryango, ifoto y’indangamuntu iheruka, n’ikimenyetso cy’aho uba.\n\nGutunganya bisanzwe bimara ibyumweru bibiri kugeza kuri bine. Uramutse itakaye, tanga raporo ku birindiro bya polisi bikwegereye, hanyuma usabe indi ku biro bimwe.',
    category_id: CAT_SERVICES,
    author_id: DEMO_USER_CONTRIBUTOR_ID,
    status: 'published',
    review_note: null,
    published_at: daysAgo(3),
    created_at: daysAgo(5),
    updated_at: daysAgo(3),
  },

  // Peaceful assembly
  {
    id: articleId(),
    translation_group_id: groupRA,
    language: 'en',
    slug: 'right-to-peaceful-assembly',
    title: 'Your right to peaceful assembly',
    excerpt:
      'What the law says about gathering peacefully, and how to give notice for a public meeting.',
    body:
      'The constitution protects your right to gather peacefully with others to express opinions or celebrate.\n\nFor a public gathering in a public space, organisers usually need to notify the local authority in advance. The notice should include the date, location, expected number of people, and a contact person.\n\nPolice may set conditions to keep the gathering safe, but they cannot ban a peaceful assembly without a lawful reason. If your notice is refused, you can appeal to the district authority.',
    category_id: CAT_RIGHTS,
    author_id: DEMO_USER_CONTRIBUTOR_ID,
    status: 'published',
    review_note: null,
    published_at: daysAgo(5),
    created_at: daysAgo(8),
    updated_at: daysAgo(5),
  },
  {
    id: articleId(),
    translation_group_id: groupRA,
    language: 'fr',
    slug: 'le-droit-de-reunion-pacifique',
    title: 'Votre droit de réunion pacifique',
    excerpt:
      'Ce que dit la loi sur les rassemblements pacifiques et comment déclarer une réunion publique.',
    body:
      "La constitution protège votre droit de vous réunir pacifiquement avec d’autres pour exprimer des opinions ou célébrer un événement.\n\nPour un rassemblement dans un espace public, les organisateurs doivent généralement notifier l’autorité locale à l’avance. La notification doit inclure la date, le lieu, le nombre attendu de participants et une personne de contact.\n\nLa police peut fixer des conditions pour assurer la sécurité, mais elle ne peut pas interdire un rassemblement pacifique sans motif légal. Si votre notification est refusée, vous pouvez faire appel auprès des autorités du district.",
    category_id: CAT_RIGHTS,
    author_id: DEMO_USER_CONTRIBUTOR_ID,
    status: 'published',
    review_note: null,
    published_at: daysAgo(5),
    created_at: daysAgo(8),
    updated_at: daysAgo(5),
  },
  {
    id: articleId(),
    translation_group_id: groupRA,
    language: 'rw',
    slug: 'uburenganzira-bwo-guhurira-mu-mahoro',
    title: 'Uburenganzira bwo guhurira mu mahoro',
    excerpt:
      'Icyo itegeko rivuga ku guteranira mu mahoro n’uburyo bwo kumenyesha inama rusange.',
    body:
      'Itegeko-nshinga ririnda uburenganzira bwo guterana mu mahoro n’abandi mu kugaragaza ibitekerezo cyangwa kwizihiza ikintu.\n\nKu iterana rikorerwa ahantu rusange, abategura bagomba kumenyesha ubuyobozi bwaho mbere y’igihe. Iyo nyandiko igomba kugaragaza itariki, ahantu, umubare w’abitezwe, n’umuntu ushinzwe kuvugana.\n\nPolisi ishobora gushyiraho amabwiriza y’umutekano, ariko ntishobora kubuza iterana ry’amahoro nta mpamvu iteganijwe n’amategeko. Niba wangiwe uburenganzira bwo guterana, ushobora kujurira ku buyobozi bw’akarere.',
    category_id: CAT_RIGHTS,
    author_id: DEMO_USER_CONTRIBUTOR_ID,
    status: 'published',
    review_note: null,
    published_at: daysAgo(5),
    created_at: daysAgo(8),
    updated_at: daysAgo(5),
  },

  // Sector elections
  {
    id: articleId(),
    translation_group_id: groupSE,
    language: 'en',
    slug: 'how-sector-elections-work',
    title: 'How sector elections work',
    excerpt:
      'A plain-language guide to how leaders at the sector level are chosen and who can vote.',
    body:
      'Sector-level leaders are the closest elected officials to most citizens. Their decisions shape schools, roads, and local services.\n\nEvery registered voter in the sector may vote. You need to be at least 18 and to appear on the voter register — check your registration at the sector office ahead of election day.\n\nCandidates campaign for a few weeks, then voters cast their ballots on a set day. Results are announced at the sector office and published locally soon after.',
    category_id: CAT_ELECTIONS,
    author_id: DEMO_USER_CONTRIBUTOR_ID,
    status: 'published',
    review_note: null,
    published_at: daysAgo(10),
    created_at: daysAgo(14),
    updated_at: daysAgo(10),
  },
  {
    id: articleId(),
    translation_group_id: groupSE,
    language: 'fr',
    slug: 'comment-fonctionnent-les-elections-au-niveau-du-secteur',
    title: 'Comment fonctionnent les élections au niveau du secteur',
    excerpt:
      'Un guide en langage clair sur la façon dont les responsables du secteur sont choisis et qui peut voter.',
    body:
      'Les responsables du secteur sont les élus les plus proches de la plupart des citoyens. Leurs décisions influent sur les écoles, les routes et les services locaux.\n\nTout électeur inscrit dans le secteur peut voter. Il faut avoir au moins 18 ans et figurer sur la liste électorale — vérifiez votre inscription au bureau du secteur avant le jour du scrutin.\n\nLes candidats font campagne pendant quelques semaines, puis les électeurs votent à une date fixée. Les résultats sont annoncés au bureau du secteur et publiés localement peu après.',
    category_id: CAT_ELECTIONS,
    author_id: DEMO_USER_CONTRIBUTOR_ID,
    status: 'published',
    review_note: null,
    published_at: daysAgo(10),
    created_at: daysAgo(14),
    updated_at: daysAgo(10),
  },
  {
    id: articleId(),
    translation_group_id: groupSE,
    language: 'rw',
    slug: 'uko-amatora-y-umurenge-akorwa',
    title: 'Uko amatora y’umurenge akorwa',
    excerpt:
      'Uburyo bworoshye bwo gusobanura uko abayobozi b’umurenge batorwa n’abemerewe gutora.',
    body:
      'Abayobozi ku rwego rw’umurenge ni bo bayobozi batorewe bari hafi cyane y’abaturage benshi. Ibyemezo byabo bigira ingaruka ku mashuri, imihanda, na serivisi zaho.\n\nUmutora wese wanditse mu murenge arashobora gutora. Ugomba kuba ufite nibura imyaka 18 kandi wanditse ku rutonde rw’abatora — genzura iyandikwa ryawe ku biro by’umurenge mbere y’umunsi w’amatora.\n\nAbakandida bakora kampanye mu byumweru bike, hanyuma abatora bagatora ku munsi ushyizweho. Ibyavuye mu matora bitangazwa ku biro by’umurenge no gusohorwa aho ari hose vuba nyuma yaho.',
    category_id: CAT_ELECTIONS,
    author_id: DEMO_USER_CONTRIBUTOR_ID,
    status: 'published',
    review_note: null,
    published_at: daysAgo(10),
    created_at: daysAgo(14),
    updated_at: daysAgo(10),
  },

  // Minimum wage
  {
    id: articleId(),
    translation_group_id: groupMW,
    language: 'en',
    slug: 'understanding-the-minimum-wage',
    title: 'Understanding the minimum wage',
    excerpt:
      'What a minimum wage is, who it applies to, and where to complain if you’re paid less.',
    body:
      'A minimum wage is the lowest amount an employer may legally pay a worker for a set period of work, usually per hour, day, or month.\n\nIf you believe your employer is paying you below the legal minimum, first ask for a written pay statement. Employers are required to provide one on request.\n\nIf the problem is not resolved, you can file a complaint with the labour inspectorate in your district. Complaints can be made in person, by phone, or in writing, and your name can be kept confidential during the initial review.',
    category_id: CAT_WORK,
    author_id: DEMO_USER_CONTRIBUTOR_ID,
    status: 'published',
    review_note: null,
    published_at: daysAgo(14),
    created_at: daysAgo(18),
    updated_at: daysAgo(14),
  },
  {
    id: articleId(),
    translation_group_id: groupMW,
    language: 'fr',
    slug: 'comprendre-le-salaire-minimum',
    title: 'Comprendre le salaire minimum',
    excerpt:
      'Ce qu’est un salaire minimum, à qui il s’applique et où se plaindre si vous êtes payé moins.',
    body:
      "Le salaire minimum est le montant le plus bas qu’un employeur peut légalement payer un travailleur pour une période de travail donnée, généralement par heure, jour ou mois.\n\nSi vous pensez que votre employeur vous paie en dessous du minimum légal, demandez d’abord une fiche de paie écrite. Les employeurs sont tenus d’en fournir une sur demande.\n\nSi le problème n’est pas résolu, vous pouvez déposer une plainte auprès de l’inspection du travail de votre district. Les plaintes peuvent être déposées en personne, par téléphone ou par écrit, et votre nom peut rester confidentiel pendant la première phase.",
    category_id: CAT_WORK,
    author_id: DEMO_USER_CONTRIBUTOR_ID,
    status: 'published',
    review_note: null,
    published_at: daysAgo(14),
    created_at: daysAgo(18),
    updated_at: daysAgo(14),
  },
  {
    id: articleId(),
    translation_group_id: groupMW,
    language: 'rw',
    slug: 'gusobanukirwa-umushahara-fatizo',
    title: 'Gusobanukirwa umushahara fatizo',
    excerpt:
      'Icyo umushahara fatizo aricyo, uwo ureba, n’aho ushobora kwitabaza waba uhembwa munsi yawo.',
    body:
      'Umushahara fatizo ni amafaranga make cyane umukoresha yemerewe guha umukozi ku kazi kamaze igihe kizwi, hasanzwe ku isaha, ku munsi, cyangwa ku kwezi.\n\nNiba utekereza ko umukoresha wawe akwishyura munsi y’umushahara fatizo, banza usabe icyemezo cy’umushahara cyanditse. Abakoresha bategetswe kubitanga iyo bibazwe.\n\nIkibazo nikitakemuka, ushobora gutanga ikirego mu bugenzuzi bw’umurimo mu karere kawe. Ibirego bishobora gutangwa mu buryo bw’imbonankubone, kuri telefone, cyangwa mu nyandiko, kandi izina ryawe rishobora kubikwa mu ibanga mu isuzuma ry’ibanze.',
    category_id: CAT_WORK,
    author_id: DEMO_USER_CONTRIBUTOR_ID,
    status: 'published',
    review_note: null,
    published_at: daysAgo(14),
    created_at: daysAgo(18),
    updated_at: daysAgo(14),
  },

  // Land titles
  {
    id: articleId(),
    translation_group_id: groupLT,
    language: 'en',
    slug: 'understanding-land-titles',
    title: 'Understanding land titles',
    excerpt:
      'What a land title shows, why it matters, and the first steps if you need to transfer or check ownership.',
    body:
      'A land title is the official record that shows who has legal rights to a plot. It protects buyers, heirs, and people who invest in homes or farms.\n\nBefore buying land, ask to see the title and verify it with the land authority or sector office. Never rely only on a verbal agreement.\n\nTo transfer ownership after a sale or inheritance, both parties usually visit the land office with identity documents, the existing title, and the sale or succession papers.',
    category_id: CAT_LAND,
    author_id: DEMO_USER_CONTRIBUTOR_ID,
    status: 'published',
    review_note: null,
    published_at: daysAgo(4),
    created_at: daysAgo(7),
    updated_at: daysAgo(4),
  },
  {
    id: articleId(),
    translation_group_id: groupLT,
    language: 'fr',
    slug: 'comprendre-les-titres-fonciers',
    title: 'Comprendre les titres fonciers',
    excerpt:
      'Ce qu’indique un titre foncier, pourquoi il compte, et les premiers pas pour céder ou vérifier une propriété.',
    body:
      'Un titre foncier est l’enregistrement officiel des droits sur une parcelle. Il protège les acheteurs, les héritiers et ceux qui investissent dans un logement ou une exploitation.\n\nAvant d’acheter, demandez à voir le titre et vérifiez-le auprès de l’autorité foncière ou du bureau du secteur.',
    category_id: CAT_LAND,
    author_id: DEMO_USER_CONTRIBUTOR_ID,
    status: 'published',
    review_note: null,
    published_at: daysAgo(4),
    created_at: daysAgo(7),
    updated_at: daysAgo(4),
  },
  {
    id: articleId(),
    translation_group_id: groupLT,
    language: 'rw',
    slug: 'gusobanukirwa-ibyemezo-by-ubutaka',
    title: 'Gusobanukirwa ibyemezo by’ubutaka',
    excerpt:
      'Icyo icyemezo cy’ubutaka kigaragaza, impamvu gifite agaciro, n’intambwe z’ibanze zo guhindura cyangwa kugenzura uburenganzira.',
    body:
      'Icyemezo cy’ubutaka ni inyandiko yemewe igaragaza ufite uburenganzira ku gice cy’ubutaka. Kirinda abaguzi, abagira umurage, n’abashyira imari mu rugo cyangwa mu murima.\n\nMbere yo kugura, saba kubona icyemezo kandi ugenzure ku buyobozi bw’ubutaka cyangwa ku biro by’umurenge.',
    category_id: CAT_LAND,
    author_id: DEMO_USER_CONTRIBUTOR_ID,
    status: 'published',
    review_note: null,
    published_at: daysAgo(4),
    created_at: daysAgo(7),
    updated_at: daysAgo(4),
  },
];

// Shown on the login page for demo mode.
export const DEMO_CREDENTIALS = [
  {
    email: 'contributor@juza.demo',
    password: 'demo1234',
    role: 'contributor' as const,
    profileId: DEMO_USER_CONTRIBUTOR_ID,
    label: 'Contributor',
  },
  {
    email: 'admin@juza.demo',
    password: 'demo1234',
    role: 'admin' as const,
    profileId: DEMO_USER_ADMIN_ID,
    label: 'Admin',
  },
];
