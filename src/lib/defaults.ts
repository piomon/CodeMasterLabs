import type { HomepageContent, Settings, Service, Project, Locale, NavigationContent, FooterContent, FAQ } from '@/types/site'
export const settings: Record<Locale, Settings> = {
 pl: {
   brandName: 'CodeMaster', brandSuffix: 'SOFTWARE HOUSE', founderName: 'Piotr Montewka', founderRole: 'Software Architect / Founder', email: 'contact@example.invalid',
   announcement: 'Od pomysłu po wdrożenie i dalszy rozwój.',
  heroEyebrow: 'SOFTWARE · SYSTEMY · AUTOMATYZACJA · AI',
   heroTitle: 'Twój pomysł.\nNasza technologia.\nWspólny sukces.',
   heroLead: 'CodeMaster to software house tworzący aplikacje, strony WWW, systemy dla firm i rozwiązania AI. Prowadzimy projekt od koncepcji i testów po wdrożenie oraz wsparcie.',
   primaryCTA: 'Zobacz koncepcje', secondaryCTA: 'Porozmawiajmy o projekcie',
   trustHeadline: 'Technologia dopasowana\ndo Twojego biznesu.',
   trustCopy: 'Najpierw poznajemy problem. Następnie ustalamy zakres, pokazujemy działające wersje i wspólnie dopracowujemy produkt. Po wdrożeniu możemy nadal go utrzymywać i rozwijać.',
   aboutCopy: 'CodeMaster realizuje projekty od analizy i UX przez kod, testy i wdrożenie po opiekę techniczną. Dobieramy technologię do potrzeb, a nie odwrotnie. W zależności od projektu przygotowujemy panel lub CMS do samodzielnego zarządzania treścią i danymi. Zakres przekazania kodu, dostępów i praw określa umowa.',
   seoTitle: 'CodeMaster — Software house: aplikacje, strony WWW, AI',
   seoDescription: 'Aplikacje webowe, SaaS, systemy dla firm, strony WWW, automatyzacja i AI. Od koncepcji przez testy i wdrożenie po utrzymanie i rozwój.'
 },
 en: {
   brandName: 'CodeMaster', brandSuffix: 'SOFTWARE HOUSE', founderName: 'Piotr Montewka', founderRole: 'Software Architect / Founder', email: 'contact@example.invalid',
   announcement: 'From the first idea to launch and beyond.', heroEyebrow: 'SOFTWARE · SYSTEMS · AUTOMATION · AI',
   heroTitle: 'Your idea.\nOur technology.\nShared success.',
   heroLead: 'CodeMaster is a software house building custom apps, websites, business systems and AI solutions. We take projects from concept and testing through launch and ongoing support.',
   primaryCTA: 'Explore concepts', secondaryCTA: 'Let’s discuss your project',
   trustHeadline: 'Technology shaped\naround your business.', trustCopy: 'First we understand the problem. Then we define the scope, share working versions and refine the product with you. We can support and evolve it after launch.',
   aboutCopy: 'CodeMaster takes projects from discovery and UX through development, testing and launch to technical support. We choose technology to fit the need, not the other way around. Where appropriate, we build an admin panel or CMS so you can manage content and data yourself. The agreement defines delivery of code, access and rights.',
   seoTitle: 'CodeMaster — Software house: apps, websites and AI', seoDescription: 'Custom web apps, SaaS, business systems, websites, automation and AI. From concept and testing through launch, maintenance and growth.'
 }
}
export const stages = {
 pl: [
   { title: 'Rozmowa', description: 'Poznajemy cel, użytkowników i proces — bez wymogu specyfikacji technicznej.' },
   { title: 'Koncepcja', description: 'W odpowiednich projektach pokazujemy poglądowe demo przed decyzją o pełnej realizacji.' },
   { title: 'Zakres', description: 'Ustalamy funkcje, etapy, budżet, zasady odbioru i prawa w umowie.' },
   { title: 'Budowa', description: 'Tworzymy działające wersje, które możesz testować i konsultować z zespołem.' },
   { title: 'Testy', description: 'Sprawdzamy kluczowe ścieżki, formularze, uprawnienia i działanie na różnych ekranach.' },
   { title: 'Wdrożenie', description: 'Uruchamiamy rozwiązanie i przekazujemy ustalone dostępy oraz dokumentację.' },
   { title: 'Rozwój', description: 'Opcjonalnie zapewniamy utrzymanie, monitoring, aktualizacje i kolejne funkcje.' }
 ],
 en: [
   { title: 'Conversation', description: 'We learn your goals, users and workflow. No technical specification required.' },
   { title: 'Concept', description: 'Where suitable, we show an illustrative demo before you commit to the full build.' },
   { title: 'Scope', description: 'We agree on features, phases, budget, acceptance and rights in the contract.' },
   { title: 'Build', description: 'We share working versions for you and your team to test and discuss.' },
   { title: 'QA', description: 'We check key flows, forms, permissions and different screen sizes.' },
   { title: 'Launch', description: 'We deploy and hand over the agreed access and documentation.' },
   { title: 'Growth', description: 'Optional maintenance, monitoring, updates and new features keep the product moving.' }
 ]
}
const messagesPL = [
 ['client', 'Dzień dobry. Mam pomysł na system dla firmy, ale nie mam gotowej specyfikacji.', 0],
  ['me', 'To nie problem. Najpierw poznajemy proces i użytkowników, a potem proponujemy rozwiązanie.', 0],
 ['client', 'Nie chciałbym jednak od razu podpisywać umowy na projekt, którego jeszcze nie widziałem.', 1],
  ['me', 'Jeśli projekt na to pozwala, przygotujemy poglądowe demo przed umową na pełną realizację.', 1],
 ['client', 'Super. A co później?', 2],
  ['me', 'Ustalimy zakres, etapy, wycenę i zasady odbioru. Dodatkowe pomysły omówimy osobno.', 2],
 ['client', 'A kod i aplikacja później należą do mnie?', 3],
  ['me', 'Warunki korzystania i ewentualnego przeniesienia praw do wykonanego kodu określimy w umowie; licencje zewnętrzne pozostają odrębne.', 3],
 ['client', 'Czy podczas pracy będę widział postęp?', 4],
  ['me', 'Tak. Udostępniamy działające wersje do testów i zbieramy uwagi przed kolejnymi etapami.', 4],
 ['client', 'A po uruchomieniu?', 5],
  ['me', 'Testujemy kluczowe ścieżki, wdrażamy rozwiązanie i przekazujemy ustalone dostępy. Możemy też zadbać o utrzymanie i rozwój.', 5],
 ['client', 'Właśnie takiej współpracy szukam.', 6]
] as const
const messagesEN = [
 ['client', 'Hello! I have an idea for a business system, but no specification yet.', 0],
  ['me', 'No problem. We first learn about your workflow and users, then propose a solution.', 0],
 ['client', 'I would rather not sign a contract for something I have never seen.', 1],
  ['me', 'Where suitable, we can prepare an illustrative demo before a contract for the full build.', 1],
 ['client', 'Great. What happens next?', 2],
  ['me', 'We agree on scope, phases, pricing and acceptance. New ideas can be discussed separately.', 2],
 ['client', 'Will I own the code and the application?', 3],
  ['me', 'The agreement defines usage and any transfer of rights to the custom code; third-party licences remain separate.', 3],
 ['client', 'Will I be able to see the progress?', 4],
  ['me', 'Yes. We share working versions for testing and gather feedback before the next phase.', 4],
 ['client', 'And after launch?', 5],
  ['me', 'We test key flows, deploy and hand over the agreed access. We can also support and evolve the system.', 5],
 ['client', 'That is exactly the kind of collaboration I was looking for.', 6]
] as const
export const homepage: Record<Locale, HomepageContent> = {
 pl: {
  servicesKicker: '01 / MOŻLIWOŚCI', servicesTitle: 'Od strony WWW\npo system dla firmy.', servicesDescription: 'Projektujemy i budujemy aplikacje, SaaS, CRM, strony WWW, automatyzacje i integracje. Zakres dopasowujemy do Twojego celu.',
  projectsKicker: '02 / OD POMYSŁU DO PRODUKTU', projectsTitle: 'Zobacz kierunek.\nPotem podejmij decyzję.', projectsDescription: 'Trzy autorskie koncepcje pokazujące sposób myślenia o produkcie — nie wdrożenia dla klientów ani obietnice wyników.',
  processKicker: '03 / JAK PRACUJEMY', processTitle: 'Jasny proces.\nWidoczny postęp.', processDescription: 'Od rozmowy i opcjonalnego demo, przez działające wersje i Twoje testy, po QA, wdrożenie oraz dalsze wsparcie.',
  aboutKicker: '07 / O CODEMASTER', contactKicker: '08 / TWÓJ NASTĘPNY KROK', contactTitle: 'Opowiedz nam,\nco chcesz zbudować.', contactDescription: 'Masz pomysł lub system do przebudowy? Napisz kilka zdań.\nSpecyfikacja techniczna nie jest potrzebna.',
  trustItems: [{text:'Koncepcja lub demo, gdy ma to sens'}, {text:'Działające wersje do testów'}, {text:'Jasny zakres i prawa w umowie'}], stages: stages.pl,
 conversation: messagesPL.map(([side,text,stage])=>({side,text,stage}))
 },
 en: {
  servicesKicker: '01 / WHAT WE CAN BUILD', servicesTitle: 'From websites\nto business systems.', servicesDescription: 'We design and build apps, SaaS, CRM, websites, automation and integrations around your goals.',
  projectsKicker: '02 / FROM IDEA TO PRODUCT', projectsTitle: 'See the direction.\nThen decide.', projectsDescription: 'Three original product concepts showing how we think — not client deliveries or claims of achieved results.',
  processKicker: '03 / HOW WE WORK', processTitle: 'A clear process.\nVisible progress.', processDescription: 'From discovery and an optional demo to working releases, your feedback, QA, deployment and ongoing support.',
  aboutKicker: '07 / ABOUT CODEMASTER', contactKicker: '08 / YOUR NEXT STEP', contactTitle: 'Tell us what\nyou want to build.', contactDescription: 'A new idea or an existing system to improve? Send us a few lines.\nNo technical specification needed.',
  trustItems: [{text:'A concept or demo where useful'}, {text:'Working versions to test'}, {text:'Clear scope and rights in the contract'}], stages: stages.en,
 conversation: messagesEN.map(([side,text,stage])=>({side,text,stage}))
 }
}
const servicePL = [
  ['Systemy dla firm','Systemy wewnętrzne, CRM, rezerwacje, projekty i dokumenty. Projektujemy role, uprawnienia, raporty oraz panel administracyjny do samodzielnej obsługi danych.','BUSINESS SYSTEMS','dashboard','Jeden uporządkowany proces zamiast wielu arkuszy.'],
  ['Aplikacje webowe i PWA','Aplikacje na zamówienie, platformy SaaS i portale klientów: od UX i backendu po bazę danych, responsywny interfejs i kolejne działające wersje do testów.','WEB / PWA','dashboard','Produkt dopasowany do użytkowników i modelu biznesowego.'],
  ['Automatyzacja i AI','Automatyzujemy obieg informacji, dokumentów i raportów. Budujemy chatboty, asystentów i agentów AI z kontrolą człowieka tam, gdzie jest potrzebna — po ocenie sensu biznesowego.','AI / AUTOMATION','ai','Mniej rutynowych czynności, więcej czasu na decyzje.'],
  ['Strony WWW','Strony firmowe i landing page: szybkie, responsywne i łatwe do aktualizacji w CMS. Możemy rozszerzyć zakres o analitykę, techniczne SEO i rozwój strony sprzedażowej.','DIGITAL EXPERIENCE','web','Strona, nad którą masz kontrolę bez programisty.'],
  ['E-commerce','Sklepy z katalogiem produktów, płatnościami, obsługą zamówień i panelem administracyjnym. Łączymy proces sprzedaży z potrzebnymi usługami i testujemy kluczowe ścieżki zakupowe.','COMMERCE','mobile','Prostsza obsługa zakupów dla klientów i zespołu.'],
  ['Integracje','Projektujemy API i łączymy istniejące usługi, np. CRM, płatności, pocztę czy komunikatory. Dane i zdarzenia przepływają między systemami bez ręcznego kopiowania.','INTEGRATIONS','web','Spójny przepływ danych między narzędziami.'],
  ['Modernizacja istniejących systemów','Analizujemy działające rozwiązanie, poprawiamy architekturę, bezpieczeństwo i UX, dodajemy funkcje etapami. Możemy przejąć utrzymanie, monitoring, kopie zapasowe i aktualizacje.','MODERNIZATION','dashboard','Rozwój bez niepotrzebnego zaczynania od zera.']
] as const
const serviceEN = [
  ['Business systems','Internal systems, CRMs, bookings, projects and documents. We design roles, permissions, reports and an admin panel for managing your data independently.','BUSINESS SYSTEMS','dashboard','One clear workflow instead of scattered spreadsheets.'],
  ['Web applications & PWA','Custom apps, SaaS platforms and customer portals: from UX and backend to databases, responsive interfaces and working releases you can test.','WEB / PWA','dashboard','A product shaped around users and your business model.'],
  ['Automation & AI','We automate information, document and reporting workflows. Chatbots, assistants and AI agents include human oversight where needed — after checking the business case.','AI / AUTOMATION','ai','Less routine work, more time for decisions.'],
  ['Websites','Business websites and landing pages: fast, responsive and easy to update in a CMS. Optional analytics, technical SEO and sales-page improvements can be scoped separately.','DIGITAL EXPERIENCE','web','A website you can manage without a developer.'],
  ['E-commerce','Stores with product catalogues, payments, order handling and an admin panel. We connect the sales flow to relevant services and test key purchase journeys.','COMMERCE','mobile','Easier purchasing and order handling.'],
  ['Integrations','We design APIs and connect existing services such as CRMs, payments, email and messaging. Data and events flow between systems without manual re-entry.','INTEGRATIONS','web','A coherent flow of data between your tools.'],
  ['Modernizing existing systems','We assess existing software, improve architecture, security and UX, and add features in stages. Ongoing maintenance, monitoring, backups and updates are available.','MODERNIZATION','dashboard','Evolve what works instead of starting over.']
] as const
export const services: Record<Locale, Service[]> = {
 pl: servicePL.map(([title,description,shortLabel,visualStyle,outcome],i)=>({id:i+1,order:i+1,title,description,shortLabel,visualStyle,outcome})),
 en: serviceEN.map(([title,description,shortLabel,visualStyle,outcome],i)=>({id:i+1,order:i+1,title,description,shortLabel,visualStyle,outcome}))
}
const projectTexts = {
 pl: [
 ['Jeden panel.\nCała firma.','SYSTEM DLA FIRMY / WEB APP','Kierunek dla firm, które chcą połączyć projekty, dokumenty, pracowników i dostęp klienta w jednym systemie.','Mniej ręcznej pracy. Jedno źródło prawdy.'],
 ['Od produktu\ndo zamówienia.','E-COMMERCE / MOBILE FIRST','Szybki sklep, prosty checkout, panel administratora oraz integracje zdejmujące z zespołu powtarzalne czynności.','Spójna droga zakupu na każdym ekranie.'],
 ['Dokumenty, które\nuruchamiają proces.','AI / AUTOMATYZACJA','Dokument trafia do systemu. Dane są rozpoznawane, sprawdzane i przekazywane do raportu lub kolejnego kroku.','Proces zamiast ręcznego przepisywania.']
 ],
 en: [
 ['One workspace.\nYour whole business.','BUSINESS SYSTEM / WEB APP','A direction for companies that want to connect projects, documents, employees and customer access in one system.','Less manual work. One source of truth.'],
 ['From product\nto purchase.','E-COMMERCE / MOBILE FIRST','A fast store, simple checkout, administration panel and integrations that remove repetitive work.','A coherent buying journey on every screen.'],
 ['Documents that\nstart the workflow.','AI / AUTOMATION','A document enters the system. Information is recognized, checked and passed to a report or the next step.','A process, not manual copying.']
 ]
}
const caseHeadings = { pl: ['Klient','Kontekst','Problem','Analiza','Koncepcja','UX / UI','Architektura','Implementacja','Mobile','Rezultat','Technologie','Następne kroki'], en: ['Client','Context','Problem','Analysis','Concept','UX / UI','Architecture','Implementation','Mobile','Outcome','Technology','Next steps'] }
const caseBodies = {
 pl: [
 'Projekt koncepcyjny CodeMaster. Nie jest prezentowany jako wdrożenie dla zewnętrznego klienta.',
 'Punkt wyjścia: codzienna praca rozproszona między narzędziami, dokumentami i wiadomościami. Koncepcja pokazuje sposób porządkowania takiego procesu.',
 'Brak wspólnego obrazu sytuacji, wielokrotne wprowadzanie tych samych danych i trudny dostęp do aktualnej informacji.',
 'Przed wdrożeniem potrzebne są rozmowy z użytkownikami, mapa procesu i ustalenie mierzalnego celu. Tutaj przedstawiono kierunek, nie wyniki badań z klientem.',
 'Spójny interfejs prowadzi przez najważniejsze zadania. Widok główny daje kontekst, a szczegóły pojawiają się wtedy, kiedy są potrzebne.',
 'Czytelna hierarchia, przewidywalna nawigacja i najważniejsze działania w zasięgu jednego kliknięcia. Wizualizacje są autorskimi interfejsami demonstracyjnymi.',
 'Proponowany podział: interfejs użytkownika, warstwa API, logika domenowa, baza danych i integracje. Szczegółowy dobór zależy od realnych wymagań.',
 'Zakres tej prezentacji obejmuje interaktywną warstwę wizualną. System klienta, uprawnienia i integracje produkcyjne wymagają osobnego projektu i testów.',
 'Ten sam cel użytkownika, inny układ ekranu. Priorytetem na telefonie są czytelność, duże pola dotykowe i krótka droga do działania.',
 'Rezultatem jest demonstracja kierunku produktu. Nie publikujemy fikcyjnych oszczędności, wskaźników sprzedaży ani opinii klientów.',
 'Interfejs demonstracyjny: React, TypeScript i CSS. Architekturę docelowego produktu dobieramy po analizie procesu, integracji i wymagań bezpieczeństwa.',
 'Omówmy Twoją sytuację. Następny krok to priorytety, demo dopasowane do procesu i jasny zakres realizacji.'
 ],
 en: [
 'A CodeMaster concept project. Not presented as a delivery for an external client.',
 'The starting point: everyday work spread across tools, documents and messages. This concept explores a more coherent process.',
 'No shared view of progress, repeated data entry and difficult access to current information.',
 'A real delivery starts with user conversations, a process map and measurable goals. This page illustrates a direction, not completed client research.',
 'One coherent interface for the most important tasks. The overview provides context; detail appears when it becomes relevant.',
 'Clear hierarchy, predictable navigation and important actions within reach. All visuals are original demonstration interfaces.',
 'A proposed separation of interface, API, domain logic, database and integrations. Final decisions depend on actual requirements.',
 'This presentation implements the visual concept. A production client system, permissions and integrations require a separate project and testing.',
 'The same user goal with a different screen layout. On mobile, readability, touch targets and a short path to action take priority.',
 'The result is a product direction demonstration. No invented savings, sales metrics or client reviews.',
 'Demonstration interface: React, TypeScript and CSS. Production architecture is chosen after understanding the process and security needs.',
 'Let’s discuss your business. Priorities, a relevant demo and a clear delivery scope are the next steps.'
 ]
}
export const projects: Record<Locale, Project[]> = { pl: [], en: [] }
for (const locale of ['pl','en'] as const) {
 projects[locale] = projectTexts[locale].map(([title,category,summary,result],i)=>({
  id:i+1, order:i+1, slug:['jeden-panel-cala-firma','commerce-mobile-first','dokumenty-i-automatyzacja'][i],title,category,summary,result,
  visualStyle: (['dashboard','mobile','ai'] as const)[i],featured:i===0,concept:true,
  sections: caseHeadings[locale].map((heading,j)=>({heading,body:caseBodies[locale][j]})), technologies:[{name:'React'},{name:'TypeScript'},{name:'CSS'}]
 }))
}
export const navigation: Record<Locale, NavigationContent> = {
  pl:{cta:'Porozmawiajmy',links:[{label:'Koncepcje',href:'/#work'},{label:'Usługi',href:'/#services'},{label:'Jak pracujemy',href:'/#process'},{label:'Journal',href:'/#journal'},{label:'O nas',href:'/#about'}]},
  en:{cta:'Let’s talk',links:[{label:'Concepts',href:'/en#work'},{label:'Services',href:'/en#services'},{label:'Our process',href:'/en#process'},{label:'Journal',href:'/en#journal'},{label:'About us',href:'/en#about'}]}
}
export const footer: Record<Locale, FooterContent> = {
  pl:{statement:'Masz pomysł? Zbudujmy rozwiązanie, które ma sens.',footnote:'Od koncepcji i kodu po wdrożenie i rozwój.',links:[{label:'Prywatność',href:'/polityka-prywatnosci'},{label:'Cookies',href:'/cookies'},{label:'Blog',href:'/blog'}]},
  en:{statement:'Have an idea? Let’s build the right solution.',footnote:'From concept and code to launch and growth.',links:[{label:'Privacy',href:'/en/privacy'},{label:'Cookies',href:'/en/cookies'},{label:'Journal',href:'/en/blog'}]}
}
export const faqs: Record<Locale, FAQ[]> = {
  pl:[{id:1,question:'Czy potrzebuję gotowej specyfikacji?',answer:'Nie. Opowiedz nam o celu, użytkownikach i obecnym procesie. Pomożemy ustalić zakres i dobrać technologię.'},{id:2,question:'Czy mogę zobaczyć demo przed realizacją?',answer:'W odpowiednich projektach możemy przygotować poglądową koncepcję lub demo przed umową na pełną realizację. Zakres takiego etapu uzgadniamy indywidualnie.'},{id:3,question:'Jak wyglądają prawa do kodu?',answer:'Umowa określa przekazanie kodu, dostępów i dokumentacji oraz zakres korzystania lub przeniesienia autorskich praw majątkowych. Biblioteki i usługi zewnętrzne podlegają osobnym licencjom.'}],
  en:[{id:1,question:'Do I need a detailed specification?',answer:'No. Tell us about your goals, users and current workflow. We can help define scope and choose the technology.'},{id:2,question:'Can I see a demo before development?',answer:'Where suitable, we can prepare an illustrative concept or demo before the contract for the full build. We agree on the scope of that stage individually.'},{id:3,question:'Who owns the code?',answer:'The contract defines delivery of code, access and documentation, and the scope of use or transfer of economic rights. Third-party libraries and services have separate licences.'}]
}
