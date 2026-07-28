-- 0006_seed_more_articles.sql
-- Extra sample articles and categories. Safe to re-run.

-- 1) Categories (create any that are missing)
insert into public.categories (slug, name_en, name_fr, name_rw,
                               description_en, description_fr, description_rw,
                               icon, sort_order)
values
  ('rights-and-freedoms',
    'Rights & Freedoms', 'Droits et libertés', 'Uburenganzira n''ubwisanzure',
    'Constitution, courts, protections.',
    'Constitution, tribunaux, protections.',
    'Itegeko-Nshinga, inkiko, kurindwa.',
    'scale', 10),
  ('public-services',
    'Public Services', 'Services publics', 'Serivisi rusange',
    'IDs, health, education, water.',
    'Papiers, santé, éducation, eau.',
    'Indangamuntu, ubuzima, uburezi, amazi.',
    'building-2', 20),
  ('elections-and-governance',
    'Elections & Governance', 'Élections et gouvernance', 'Amatora n''imiyoborere',
    'How decisions get made.',
    'Comment se prennent les décisions.',
    'Uko ibyemezo bifatwa.',
    'vote', 30),
  ('work-and-money',
    'Work & Money', 'Travail et argent', 'Akazi n''amafaranga',
    'Jobs, taxes, benefits, small business.',
    'Emploi, impôts, aides, petite entreprise.',
    'Akazi, imisoro, inkunga, ubucuruzi buto.',
    'briefcase', 40),
  ('land-and-housing',
    'Land & Housing', 'Terre et logement', 'Ubutaka n''amazu',
    'Titles, disputes, rent, planning.',
    'Titres, litiges, loyer, urbanisme.',
    'Impapuro z''ubutaka, amakimbirane, ubukode, imitunganyirize.',
    'home', 50),
  ('health',
    'Health', 'Santé', 'Ubuzima',
    'Clinics, insurance, common health services.',
    'Cliniques, assurance, services de santé courants.',
    'Amavuriro, ubwishingizi, serivisi z''ubuzima.',
    'heart', 60)
on conflict (slug) do nothing;

-- 2) All sample articles
do $$
declare
  cat_rf uuid := (select id from public.categories where slug = 'rights-and-freedoms');
  cat_ps uuid := (select id from public.categories where slug = 'public-services');
  cat_eg uuid := (select id from public.categories where slug = 'elections-and-governance');
  cat_wm uuid := (select id from public.categories where slug = 'work-and-money');
  cat_lh uuid := (select id from public.categories where slug = 'land-and-housing');
  gid uuid;
begin

  -- National ID
  if cat_ps is not null then
    gid := gen_random_uuid();
    insert into public.articles
      (translation_group_id, language, slug, title, excerpt, body, category_id, status, published_at)
    values
      (gid, 'en', 'how-to-get-a-national-id',
       'How to get a national ID',
       'A step-by-step guide to applying for your national identity card and what documents you need.',
       'A national ID is the main document that proves who you are for services like banking, voting, and school enrolment.

To apply, visit your sector office with the following: a birth certificate or family record, a recent passport-size photo, and proof of residence.

Processing usually takes two to four weeks. If you lose your ID, report it at your local police station and request a replacement at the same office.',
       cat_ps, 'published', now() - interval '3 days'),
      (gid, 'fr', 'comment-obtenir-une-carte-d-identite',
       'Comment obtenir une carte d’identité',
       'Un guide pas à pas pour demander votre carte d’identité et les documents nécessaires.',
       'La carte d’identité est le document principal qui prouve votre identité pour des services comme la banque, le vote et l’inscription à l’école.

Pour en faire la demande, rendez-vous au bureau de votre secteur avec : un acte de naissance ou un livret de famille, une photo d’identité récente et un justificatif de domicile.

Le traitement prend généralement de deux à quatre semaines. Si vous perdez votre carte, signalez-le au poste de police local et demandez un duplicata au même bureau.',
       cat_ps, 'published', now() - interval '3 days'),
      (gid, 'rw', 'uburyo-bwo-kubona-indangamuntu',
       'Uburyo bwo kubona indangamuntu',
       'Uburyo bwo gusaba indangamuntu n’inyandiko zisabwa.',
       'Indangamuntu ni yo nyandiko y’ibanze igaragaza umuntu uwo ari we mu bikorwa nk’amabanki, gutora, no kwiyandikisha ku ishuri.

Kugira ngo uyisabe, jya ku biro by’umurenge ufite: icyangombwa cy’amavuko cyangwa igitabo cy’umuryango, ifoto y’indangamuntu iheruka, n’ikimenyetso cy’aho uba.

Gutunganya bisanzwe bimara ibyumweru bibiri kugeza kuri bine. Uramutse itakaye, tanga raporo ku birindiro bya polisi bikwegereye, hanyuma usabe indi ku biro bimwe.',
       cat_ps, 'published', now() - interval '3 days')
    on conflict (slug, language) do nothing;
  end if;

  -- Peaceful assembly
  if cat_rf is not null then
    gid := gen_random_uuid();
    insert into public.articles
      (translation_group_id, language, slug, title, excerpt, body, category_id, status, published_at)
    values
      (gid, 'en', 'right-to-peaceful-assembly',
       'Your right to peaceful assembly',
       'What the law says about gathering peacefully, and how to give notice for a public meeting.',
       'The constitution protects your right to gather peacefully with others to express opinions or celebrate.

For a public gathering in a public space, organisers usually need to notify the local authority in advance. The notice should include the date, location, expected number of people, and a contact person.

Police may set conditions to keep the gathering safe, but they cannot ban a peaceful assembly without a lawful reason. If your notice is refused, you can appeal to the district authority.',
       cat_rf, 'published', now() - interval '5 days'),
      (gid, 'fr', 'le-droit-de-reunion-pacifique',
       'Votre droit de réunion pacifique',
       'Ce que dit la loi sur les rassemblements pacifiques et comment déclarer une réunion publique.',
       'La constitution protège votre droit de vous réunir pacifiquement avec d’autres pour exprimer des opinions ou célébrer un événement.

Pour un rassemblement dans un espace public, les organisateurs doivent généralement notifier l’autorité locale à l’avance. La notification doit inclure la date, le lieu, le nombre attendu de participants et une personne de contact.

La police peut fixer des conditions pour assurer la sécurité, mais elle ne peut pas interdire un rassemblement pacifique sans motif légal. Si votre notification est refusée, vous pouvez faire appel auprès des autorités du district.',
       cat_rf, 'published', now() - interval '5 days'),
      (gid, 'rw', 'uburenganzira-bwo-guhurira-mu-mahoro',
       'Uburenganzira bwo guhurira mu mahoro',
       'Icyo itegeko rivuga ku guteranira mu mahoro n’uburyo bwo kumenyesha inama rusange.',
       'Itegeko-nshinga ririnda uburenganzira bwo guterana mu mahoro n’abandi mu kugaragaza ibitekerezo cyangwa kwizihiza ikintu.

Ku iterana rikorerwa ahantu rusange, abategura bagomba kumenyesha ubuyobozi bwaho mbere y’igihe. Iyo nyandiko igomba kugaragaza itariki, ahantu, umubare w’abitezwe, n’umuntu ushinzwe kuvugana.

Polisi ishobora gushyiraho amabwiriza yo kurinda umutekano, ariko ntishobora kubuza iterana ry’amahoro nta mpamvu yemewe n’amategeko. Niba icyo kumenyesha cyangwe, ushobora kujurira ku buyobozi bw’akarere.',
       cat_rf, 'published', now() - interval '5 days')
    on conflict (slug, language) do nothing;
  end if;

  -- Sector elections
  if cat_eg is not null then
    gid := gen_random_uuid();
    insert into public.articles
      (translation_group_id, language, slug, title, excerpt, body, category_id, status, published_at)
    values
      (gid, 'en', 'how-sector-elections-work',
       'How sector elections work',
       'Who can vote, how candidates are listed, and what happens on election day at sector level.',
       'Sector elections choose local leaders who handle day-to-day community services.

Eligible citizens vote at their assigned polling station. Bring your national ID. Polling staff check your name on the register before you cast a ballot.

Results are tallied publicly at the station, then reported upward. If you see a problem, report it to the election officials present and keep a note of the time and place.',
       cat_eg, 'published', now() - interval '10 days'),
      (gid, 'fr', 'comment-fonctionnent-les-elections-au-niveau-du-secteur',
       'Comment fonctionnent les élections au niveau du secteur',
       'Qui peut voter, comment les candidats sont inscrits, et ce qui se passe le jour du vote.',
       'Les élections de secteur désignent des responsables locaux qui gèrent les services de proximité.

Les citoyens inscrits votent au bureau de vote assigné. Apportez votre carte d’identité. Le personnel vérifie votre nom sur la liste avant le vote.

Les résultats sont comptés publiquement puis transmis. En cas de problème, signalez-le aux agents électoraux présents et notez l’heure et le lieu.',
       cat_eg, 'published', now() - interval '10 days'),
      (gid, 'rw', 'uko-amatora-y-umurenge-akorwa',
       'Uko amatora y’umurenge akorwa',
       'Uwo wemerewe gutora, uko abakandida bandikwa, n’ibibera ku munsi w’amatora.',
       'Amatora y’umurenge ahitemo abayobozi b’aho bakorera serivisi z’ibanze.

Abaturage bemerewe batora aho banditswe. Zana indangamuntu. Abakozi bagenzura izina ryawe ku rutonde mbere yo gutora.

Ibisubizo bibarwa ku mugaragaro hanyuma bikoherezwa hejuru. Niba habaye ikibazo, bimenyeshe abashinzwe amatora kandi wandike isaha n’ahantu.',
       cat_eg, 'published', now() - interval '10 days')
    on conflict (slug, language) do nothing;
  end if;

  -- Minimum wage
  if cat_wm is not null then
    gid := gen_random_uuid();
    insert into public.articles
      (translation_group_id, language, slug, title, excerpt, body, category_id, status, published_at)
    values
      (gid, 'en', 'understanding-the-minimum-wage',
       'Understanding the minimum wage',
       'What the minimum wage is, who it covers, and where to complain if you are paid less.',
       'The minimum wage is the lowest amount an employer may legally pay a worker for a defined job, often by hour, day, or month.

If you think your employer pays below the minimum, first ask for a written pay record. Employers must provide this when asked.

If the issue is not fixed, you can file a complaint with the labour inspection office in your area. Complaints can be made in person, by phone, or in writing, and your name can be kept confidential during the first review.',
       cat_wm, 'published', now() - interval '14 days'),
      (gid, 'fr', 'comprendre-le-salaire-minimum',
       'Comprendre le salaire minimum',
       'Ce qu’est le salaire minimum, qui est concerné, et où porter plainte en cas de sous-paiement.',
       'Le salaire minimum est le montant le plus bas qu’un employeur peut légalement verser pour un travail défini, souvent à l’heure, au jour ou au mois.

Si vous pensez être payé en dessous, demandez d’abord un bulletin de paie écrit. L’employeur doit le fournir sur demande.

Si rien ne change, vous pouvez déposer une plainte auprès de l’inspection du travail de votre zone. La plainte peut se faire en personne, par téléphone ou par écrit, et votre identité peut rester confidentielle au premier examen.',
       cat_wm, 'published', now() - interval '14 days'),
      (gid, 'rw', 'gusobanukirwa-umushahara-fatizo',
       'Gusobanukirwa umushahara fatizo',
       'Icyo umushahara fatizo aricyo, uwo ureba, n’aho ushobora kwitabaza waba uhembwa munsi yawo.',
       'Umushahara fatizo ni amafaranga make cyane umukoresha yemerewe guha umukozi ku kazi kamaze igihe kizwi, hasanzwe ku isaha, ku munsi, cyangwa ku kwezi.

Niba utekereza ko umukoresha wawe akwishyura munsi y’umushahara fatizo, banza usabe icyemezo cy’umushahara cyanditse. Abakoresha bategetswe kubitanga iyo bibazwe.

Ikibazo nikitakemuka, ushobora gutanga ikirego mu bugenzuzi bw’umurimo mu karere kawe. Ibirego bishobora gutangwa mu buryo bw’imbonankubone, kuri telefone, cyangwa mu nyandiko, kandi izina ryawe rishobora kubikwa mu ibanga mu isuzuma ry’ibanze.',
       cat_wm, 'published', now() - interval '14 days')
    on conflict (slug, language) do nothing;
  end if;

  -- Birth certificate
  if cat_ps is not null then
    gid := gen_random_uuid();
    insert into public.articles
      (translation_group_id, language, slug, title, excerpt, body, category_id, status, published_at)
    values
      (gid, 'en', 'how-to-get-a-birth-certificate',
       'How to get a birth certificate',
       'Where to register a birth, which documents to bring, and what to do if the record is missing.',
       'A birth certificate is often required for school, a national ID, and many public services.

Register the birth at the civil registration office for the area where the child was born. Bring proof of the birth (hospital discharge or midwife note), parents’ identity documents, and any marriage certificate if available.

Register as early as possible. Late registration is usually still possible, but you may need extra statements from local leaders. Keep a certified copy in a safe place — replacements can take time.

This guide is for everyday orientation. Confirm current fees and forms at your local civil registration office.',
       cat_ps, 'published', now() - interval '2 days'),
      (gid, 'fr', 'comment-obtenir-un-acte-de-naissance',
       'Comment obtenir un acte de naissance',
       'Où déclarer une naissance, quels documents apporter, et que faire si l’acte manque.',
       'L’acte de naissance est souvent exigé pour l’école, la carte d’identité et de nombreux services publics.

Déclarez la naissance au bureau de l’état civil du lieu de naissance. Apportez une preuve de naissance (sortie d’hôpital ou attestation de sage-femme), les pièces d’identité des parents, et un acte de mariage s’il existe.

Déclarez le plus tôt possible. Une déclaration tardive reste en général possible, mais des attestations des autorités locales peuvent être demandées. Conservez une copie certifiée en lieu sûr.

Ce guide oriente le quotidien. Vérifiez les frais et formulaires à jour auprès de votre bureau d’état civil.',
       cat_ps, 'published', now() - interval '2 days'),
      (gid, 'rw', 'uburyo-bwo-kubona-icyangombwa-cy-amavuko',
       'Uburyo bwo kubona icyangombwa cy’amavuko',
       'Aho wandikisha amavuko, inyandiko ugomba kuzana, n’uko ukora niba icyangombwa kidahari.',
       'Icyangombwa cy’amavuko gisanzwe gisabwa ku ishuri, ku ndangamuntu, no ku serivisi nyinshi za Leta.

Andikisha amavuko ku biro by’irangamimerere aho umwana yavukiye. Zana ikimenyetso cy’amavuko (icyemezo cy’ibitaro cyangwa cy’umubyaza), indangamuntu z’ababyeyi, n’icyangombwa cy’ubukwe niba gihari.

Andikisha vuba uko bishoboka. Kwandikisha nyuma y’igihe bisanzwe birashoboka, ariko ushobora gusabwa ibyemezo by’abayobozi b’aho uba. Bika kopi yemewe mu kibanze cyizewe.

Iyi nyandiko igufasha gusobanukirwa. Genzura amafaranga n’impapuro biheruka ku biro by’irangamimerere.',
       cat_ps, 'published', now() - interval '2 days')
    on conflict (slug, language) do nothing;
  end if;

  -- Land titles
  if cat_lh is not null then
    gid := gen_random_uuid();
    insert into public.articles
      (translation_group_id, language, slug, title, excerpt, body, category_id, status, published_at)
    values
      (gid, 'en', 'understanding-land-titles',
       'Understanding land titles',
       'What a land title shows, why it matters, and the first steps if you need to transfer or check ownership.',
       'A land title is the official record that shows who has legal rights to a plot. It protects buyers, heirs, and people who invest in homes or farms.

Before buying land, ask to see the title and verify it with the land authority or sector office. Never rely only on a verbal agreement.

To transfer ownership after a sale or inheritance, both parties usually visit the land office with identity documents, the existing title, and the sale or succession papers. Fees and processing times vary by district.

If there is a dispute, seek mediation locally first, then the competent land or court channel. Juza explains the common path — always confirm with the official office handling your case.',
       cat_lh, 'published', now() - interval '4 days'),
      (gid, 'fr', 'comprendre-les-titres-fonciers',
       'Comprendre les titres fonciers',
       'Ce qu’indique un titre foncier, pourquoi il compte, et les premiers pas pour céder ou vérifier une propriété.',
       'Un titre foncier est l’enregistrement officiel des droits sur une parcelle. Il protège les acheteurs, les héritiers et ceux qui investissent dans un logement ou une exploitation.

Avant d’acheter, demandez à voir le titre et vérifiez-le auprès de l’autorité foncière ou du bureau du secteur. Ne vous fiez jamais à un accord seulement oral.

Pour transférer la propriété après une vente ou une succession, les parties se rendent en général au bureau foncier avec les pièces d’identité, le titre existant et les actes de vente ou de succession. Les frais et délais varient selon le district.

En cas de litige, privilégiez d’abord une médiation locale, puis la voie foncière ou judiciaire compétente. Juza décrit le chemin habituel — confirmez toujours auprès du bureau officiel.',
       cat_lh, 'published', now() - interval '4 days'),
      (gid, 'rw', 'gusobanukirwa-ibyemezo-by-ubutaka',
       'Gusobanukirwa ibyemezo by’ubutaka',
       'Icyo icyemezo cy’ubutaka kigaragaza, impamvu gifite agaciro, n’intambwe z’ibanze zo guhindura cyangwa kugenzura uburenganzira.',
       'Icyemezo cy’ubutaka ni inyandiko yemewe igaragaza ufite uburenganzira ku gice cy’ubutaka. Kirinda abaguzi, abagira umurage, n’abashyira imari mu rugo cyangwa mu murima.

Mbere yo kugura, saba kubona icyemezo kandi ugenzure ku buyobozi bw’ubutaka cyangwa ku biro by’umurenge. Ntukiringire amasezerano yavugiwe gusa.

Kugira ngo uhindure uburenganzira nyuma y’ugurisha cyangwa umurage, abafatanya basanzwe bajya ku biro by’ubutaka bafite indangamuntu, icyemezo gisanzwe, n’inyandiko z’ugurisha cyangwa z’umurage. Amafaranga n’igihe bimara bitandukaniye uko akarere kameze.

Haba hari amakimbirane, banza ushake ubwumvikane bwaho, hanyuma ujye ku nzira yemewe y’ubutaka cyangwa y’urukiko. Juza isobanura inzira isanzwe — genzura buri gihe ku biro bikurikirana ikibazo cyawe.',
       cat_lh, 'published', now() - interval '4 days')
    on conflict (slug, language) do nothing;
  end if;

  -- Renting a home
  if cat_lh is not null then
    gid := gen_random_uuid();
    insert into public.articles
      (translation_group_id, language, slug, title, excerpt, body, category_id, status, published_at)
    values
      (gid, 'en', 'renting-a-home-basic-rights',
       'Renting a home: basic rights',
       'What to put in a rental agreement, deposits, and how to handle problems with a landlord.',
       'A written rental agreement protects both tenant and landlord. Ask for the rent amount, payment date, length of stay, and who pays utilities — in writing.

Deposits should be clearly stated and receipts kept. Before moving in, note the condition of the house with photos or a signed checklist.

If the landlord wants you to leave early, or refuses to return a fair deposit, try written negotiation first. Local mediation or a competent authority can help when talks fail.

Rules differ by area and contract type. Use this as a checklist, then confirm details with a trusted local office or legal aid service.',
       cat_lh, 'published', now() - interval '6 days'),
      (gid, 'fr', 'louer-un-logement-droits-de-base',
       'Louer un logement : droits de base',
       'Que mettre dans un bail, le dépôt de garantie, et comment gérer un conflit avec le propriétaire.',
       'Un bail écrit protège le locataire et le propriétaire. Faites préciser par écrit le loyer, la date de paiement, la durée et qui paie les charges.

Le dépôt doit être clairement indiqué et les reçus conservés. Avant d’emménager, notez l’état du logement avec des photos ou une liste signée.

Si le propriétaire veut vous faire partir plus tôt, ou refuse de rendre un dépôt raisonnable, essayez d’abord une négociation écrite. Une médiation locale ou une autorité compétente peut aider si le dialogue échoue.

Les règles varient selon le lieu et le type de contrat. Utilisez ceci comme liste de contrôle, puis confirmez auprès d’un bureau local de confiance ou d’une aide juridique.',
       cat_lh, 'published', now() - interval '6 days'),
      (gid, 'rw', 'gukodesha-inzu-uburenganzira-bw-ibanze',
       'Gukodesha inzu: uburenganzira bw’ibanze',
       'Ibyo ushyira mu masezerano y’ubukode, icyo ushyira nk’ingwate, n’uko ukemura ibibazo n’uwakodesheje.',
       'Amasezerano yanditse arinda uukodesha n’uwakodesheje. Saba ko umubare w’ubukode, itariki yo kwishyura, igihe cy’amasezerano, n’uwishyura serivisi byanditswe.

Ingwate igomba kugaragazwa neza kandi ibyemezo by’amafaranga bikabikwa. Mbere yo kwinjira, andika uko inzu imeze ufata amafoto cyangwa urutonde rwashyizweho umukono.

Niba uwakodesheje ashaka ko uva vuba, cyangwa yanga kugarura ingwate ikwiye, banza ugerageze kuvugana mu nyandiko. Ubwumvikane bwaho cyangwa ubuyobozi bubishinzwe birashobora gufasha iyo ikiganiro kirananiye.

Amabwiriza atandukaniye uko ahantu n’ubwoko bw’amasezerano bimeze. Koresha iyi nkomoko nk’urutonde, hanyuma wemeze ku biro byizewe cyangwa ubufasha bw’amategeko.',
       cat_lh, 'published', now() - interval '6 days')
    on conflict (slug, language) do nothing;
  end if;

  -- Small business
  if cat_wm is not null then
    gid := gen_random_uuid();
    insert into public.articles
      (translation_group_id, language, slug, title, excerpt, body, category_id, status, published_at)
    values
      (gid, 'en', 'starting-a-small-business',
       'Starting a small business',
       'A simple path: choose a name, register where required, and keep basic records from day one.',
       'Many small traders begin informally, but registration helps you open a bank account, bid for contracts, and stay compliant.

Typical first steps: choose a clear business name, decide whether you operate alone or with partners, and ask the local business registration desk which form applies to you.

Keep simple records of sales and expenses. Tax and licence rules depend on your activity and size — ask early rather than guessing.

This is a starting map, not a full legal checklist. Confirm requirements with the official registration and tax offices in your district.',
       cat_wm, 'published', now() - interval '8 days'),
      (gid, 'fr', 'demarrer-une-petite-entreprise',
       'Démarrer une petite entreprise',
       'Un chemin simple : choisir un nom, s’enregistrer si nécessaire, et tenir des comptes de base dès le début.',
       'Beaucoup de petits commerçants commencent de façon informelle, mais l’enregistrement aide à ouvrir un compte, répondre à des marchés et rester en règle.

Premiers pas habituels : choisir un nom clair, décider si vous travaillez seul ou avec des associés, et demander au guichet d’enregistrement local quel formulaire vous concerne.

Tenez un suivi simple des ventes et des dépenses. Les règles fiscales et de licence dépendent de votre activité et de votre taille — renseignez-vous tôt.

Ceci est une carte de départ, pas une checklist juridique complète. Confirmez auprès des bureaux officiels d’enregistrement et des impôts de votre district.',
       cat_wm, 'published', now() - interval '8 days'),
      (gid, 'rw', 'gutangira-ubucuruzi-buto',
       'Gutangira ubucuruzi buto',
       'Inzira yoroshye: hitamo izina, iyandikishe aho bisabwa, kandi ubike inyandiko z’ibanze kuva ku munsi wa mbere.',
       'Abacuruzi bato benshi batangira nta nyandiko, ariko kwiyandikisha bifasha gufungura konti ya banki, gusaba amasezerano, no kubahiriza amategeko.

Intambwe zisanzwe: hitamo izina risobanutse, ufashe icyemezo niba ukora wenyine cyangwa n’abandi, kandi ubaze ku biro by’iyandikisha ubucuruzi ubwoko bw’impapuro bukubereye.

Bika inyandiko zoroshye z’ibyagurishijwe n’amafaranga yakoreshejwe. Amategeko y’imisoro n’uruhushya bitanga bitewe n’ubwoko bw’akazi n’ingano yako — baza vuba.

Iyi ni nkarta yo gutangiriraho, si urutonde rwuzuye rw’amategeko. Emeza ku biro byemewe by’iyandikisha n’imisoro mu karere kawe.',
       cat_wm, 'published', now() - interval '8 days')
    on conflict (slug, language) do nothing;
  end if;

  -- Public information
  if cat_rf is not null then
    gid := gen_random_uuid();
    insert into public.articles
      (translation_group_id, language, slug, title, excerpt, body, category_id, status, published_at)
    values
      (gid, 'en', 'asking-for-public-information',
       'Asking for public information',
       'How to request information from a public body, what to include, and what to expect.',
       'Citizens can often request information held by public institutions to understand decisions that affect them.

Write a short request: who you are, what information you need, and why you need it if that helps the office find the right file. Keep a copy and note the date you submitted it.

Some records are public by default; others may be limited for privacy or security. If you are refused, ask for the reason in writing and whether an appeal is available.

Procedures differ by institution. Start with the office that holds the record, and escalate politely if you get no reply within a reasonable time.',
       cat_rf, 'published', now() - interval '9 days'),
      (gid, 'fr', 'demander-une-information-publique',
       'Demander une information publique',
       'Comment saisir un organisme public, quoi indiquer, et à quoi s’attendre.',
       'Les citoyens peuvent souvent demander des informations détenues par des institutions publiques pour comprendre des décisions qui les concernent.

Rédigez une demande courte : qui vous êtes, quelle information vous cherchez, et pourquoi si cela aide le bureau. Gardez une copie et notez la date d’envoi.

Certains documents sont publics ; d’autres peuvent être limités pour la vie privée ou la sécurité. En cas de refus, demandez le motif par écrit et s’il existe un recours.

Les procédures varient selon l’institution. Commencez par le bureau détenteur du dossier, puis relancez poliment si vous n’avez pas de réponse dans un délai raisonnable.',
       cat_rf, 'published', now() - interval '9 days'),
      (gid, 'rw', 'gusaba-amakuru-ya-leta',
       'Gusaba amakuru ya Leta',
       'Uburyo bwo gusaba amakuru ku kigo cya Leta, ibyo ushyiramo, n’ibyo wategereza.',
       'Abaturage bashobora gusaba amakuru afite ibigo bya Leta kugira ngo basobanukirwe n’ibyemezo bibareba.

Andika icyifuzo kigufi: uwo ari we, amakuru ushaka, n’impamvu niba bifasha biro kubona dosiye ikwiye. Bika kopi kandi wandike itariki wayohereje.

Hasanzwe hari inyandiko zisohoka ku mugaragaro; izindi zishobora kugabanywa kubera ibanga cyangwa umutekano. Niba wangiwe, saba impamvu mu nyandiko niba hari inzira yo kujurira.

Inzira zitandukaniye uko ikigo kimeze. Tangira ku biro bifite dosiye, hanyuma usubize mu buryo bwiza niba nta gisubizo mu gihe kikwiye.',
       cat_rf, 'published', now() - interval '9 days')
    on conflict (slug, language) do nothing;
  end if;

end $$;
