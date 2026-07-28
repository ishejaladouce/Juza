-- 0002_seed_articles.sql
-- Seed sample civic articles.

do $$
declare
  cat_rf uuid := (select id from public.categories where slug = 'rights-and-freedoms');
  cat_ps uuid := (select id from public.categories where slug = 'public-services');
  cat_eg uuid := (select id from public.categories where slug = 'elections-and-governance');
  cat_wm uuid := (select id from public.categories where slug = 'work-and-money');
  gid uuid;
begin

  -- How to get a national ID
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

  -- Right to peaceful assembly
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

Polisi ishobora gushyiraho amabwiriza y’umutekano, ariko ntishobora kubuza iterana ry’amahoro nta mpamvu iteganijwe n’amategeko. Niba wangiwe uburenganzira bwo guterana, ushobora kujurira ku buyobozi bw’akarere.',
     cat_rf, 'published', now() - interval '5 days')
  on conflict (slug, language) do nothing;

  -- How sector elections work
  gid := gen_random_uuid();
  insert into public.articles
    (translation_group_id, language, slug, title, excerpt, body, category_id, status, published_at)
  values
    (gid, 'en', 'how-sector-elections-work',
     'How sector elections work',
     'A plain-language guide to how leaders at the sector level are chosen and who can vote.',
     'Sector-level leaders are the closest elected officials to most citizens. Their decisions shape schools, roads, and local services.

Every registered voter in the sector may vote. You need to be at least 18 and to appear on the voter register — check your registration at the sector office ahead of election day.

Candidates campaign for a few weeks, then voters cast their ballots on a set day. Results are announced at the sector office and published locally soon after.',
     cat_eg, 'published', now() - interval '10 days'),

    (gid, 'fr', 'comment-fonctionnent-les-elections-au-niveau-du-secteur',
     'Comment fonctionnent les élections au niveau du secteur',
     'Un guide en langage clair sur la façon dont les responsables du secteur sont choisis et qui peut voter.',
     'Les responsables du secteur sont les élus les plus proches de la plupart des citoyens. Leurs décisions influent sur les écoles, les routes et les services locaux.

Tout électeur inscrit dans le secteur peut voter. Il faut avoir au moins 18 ans et figurer sur la liste électorale — vérifiez votre inscription au bureau du secteur avant le jour du scrutin.

Les candidats font campagne pendant quelques semaines, puis les électeurs votent à une date fixée. Les résultats sont annoncés au bureau du secteur et publiés localement peu après.',
     cat_eg, 'published', now() - interval '10 days'),

    (gid, 'rw', 'uko-amatora-y-umurenge-akorwa',
     'Uko amatora y’umurenge akorwa',
     'Uburyo bworoshye bwo gusobanura uko abayobozi b’umurenge batorwa n’abemerewe gutora.',
     'Abayobozi ku rwego rw’umurenge ni bo bayobozi batorewe bari hafi cyane y’abaturage benshi. Ibyemezo byabo bigira ingaruka ku mashuri, imihanda, na serivisi zaho.

Umutora wese wanditse mu murenge arashobora gutora. Ugomba kuba ufite nibura imyaka 18 kandi wanditse ku rutonde rw’abatora — genzura iyandikwa ryawe ku biro by’umurenge mbere y’umunsi w’amatora.

Abakandida bakora kampanye mu byumweru bike, hanyuma abatora bagatora ku munsi ushyizweho. Ibyavuye mu matora bitangazwa ku biro by’umurenge no gusohorwa aho ari hose vuba nyuma yaho.',
     cat_eg, 'published', now() - interval '10 days')
  on conflict (slug, language) do nothing;

  -- Understanding the minimum wage
  gid := gen_random_uuid();
  insert into public.articles
    (translation_group_id, language, slug, title, excerpt, body, category_id, status, published_at)
  values
    (gid, 'en', 'understanding-the-minimum-wage',
     'Understanding the minimum wage',
     'What a minimum wage is, who it applies to, and where to complain if you’re paid less.',
     'A minimum wage is the lowest amount an employer may legally pay a worker for a set period of work, usually per hour, day, or month.

If you believe your employer is paying you below the legal minimum, first ask for a written pay statement. Employers are required to provide one on request.

If the problem is not resolved, you can file a complaint with the labour inspectorate in your district. Complaints can be made in person, by phone, or in writing, and your name can be kept confidential during the initial review.',
     cat_wm, 'published', now() - interval '14 days'),

    (gid, 'fr', 'comprendre-le-salaire-minimum',
     'Comprendre le salaire minimum',
     'Ce qu’est un salaire minimum, à qui il s’applique et où se plaindre si vous êtes payé moins.',
     'Le salaire minimum est le montant le plus bas qu’un employeur peut légalement payer un travailleur pour une période de travail donnée, généralement par heure, jour ou mois.

Si vous pensez que votre employeur vous paie en dessous du minimum légal, demandez d’abord une fiche de paie écrite. Les employeurs sont tenus d’en fournir une sur demande.

Si le problème n’est pas résolu, vous pouvez déposer une plainte auprès de l’inspection du travail de votre district. Les plaintes peuvent être déposées en personne, par téléphone ou par écrit, et votre nom peut rester confidentiel pendant la première phase.',
     cat_wm, 'published', now() - interval '14 days'),

    (gid, 'rw', 'gusobanukirwa-umushahara-fatizo',
     'Gusobanukirwa umushahara fatizo',
     'Icyo umushahara fatizo aricyo, uwo ureba, n’aho ushobora kwitabaza waba uhembwa munsi yawo.',
     'Umushahara fatizo ni amafaranga make cyane umukoresha yemerewe guha umukozi ku kazi kamaze igihe kizwi, hasanzwe ku isaha, ku munsi, cyangwa ku kwezi.

Niba utekereza ko umukoresha wawe akwishyura munsi y’umushahara fatizo, banza usabe icyemezo cy’umushahara cyanditse. Abakoresha bategetswe kubitanga iyo bibazwe.

Ikibazo nikitakemuka, ushobora gutanga ikirego mu bugenzuzi bw’umurimo mu karere kawe. Ibirego bishobora gutangwa mu buryo bw’imbonankubone, kuri telefone, cyangwa mu nyandiko, kandi izina ryawe rishobora kubikwa mu ibanga mu isuzuma ry’ibanze.',
     cat_wm, 'published', now() - interval '14 days')
  on conflict (slug, language) do nothing;

end $$;
