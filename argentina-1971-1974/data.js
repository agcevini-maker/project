/* =========================================================
   Argentina 1971–1974 · Contenido de la guía
   ---------------------------------------------------------
   Todo el texto de la página sale de este archivo.
   app.js solo lo dibuja: para corregir o ampliar algo,
   editá acá.
   ========================================================= */

/* ---------- Antes de 1971: cómo se llegó hasta acá ---------- */
const BACKGROUND = [
  {
    date: "Septiembre de 1955",
    title: "Derrocamiento y exilio de Perón",
    text: "Un golpe militar, la autodenominada “Revolución Libertadora”, derroca a Perón durante su segunda presidencia. Comienza un exilio que lo llevará por varios países hasta instalarse en Madrid en 1960.",
  },
  {
    date: "1955–1973",
    title: "La proscripción del peronismo",
    text: "Durante 18 años el peronismo no puede presentar candidatos propios a presidente. Hasta su nombre y sus símbolos llegan a estar prohibidos. Los gobiernos civiles de esos años son débiles y los militares intervienen una y otra vez.",
  },
  {
    date: "Junio de 1966",
    title: "La “Revolución Argentina”",
    text: "Otro golpe lleva al poder al general Juan Carlos Onganía, que disuelve el Congreso y los partidos políticos y se propone gobernar sin plazos.",
  },
  {
    date: "Mayo de 1969",
    title: "El Cordobazo",
    text: "Obreros y estudiantes protagonizan una gran rebelión en Córdoba. El gobierno militar queda debilitado y la protesta social crece en todo el país.",
  },
  {
    date: "1970",
    title: "Organizaciones armadas y caída de Onganía",
    text: "Montoneros se da a conocer con el secuestro y asesinato del general Pedro Eugenio Aramburu. Actúan también otras organizaciones armadas, peronistas y de izquierda, como las FAR, las FAP y el ERP. En junio, Onganía es desplazado y lo reemplaza el general Roberto Levingston.",
  },
  {
    date: "Noviembre de 1970",
    title: "La Hora del Pueblo",
    text: "Peronistas, radicales y otros partidos firman un acuerdo para reclamar elecciones libres y sin proscripciones. Es un gesto de convivencia entre fuerzas que habían sido rivales durante años.",
  },
  {
    date: "Marzo de 1971",
    title: "Viborazo y llegada de Lanusse",
    text: "Una nueva rebelión en Córdoba, el Viborazo, precipita la caída de Levingston. Asume el general Alejandro Agustín Lanusse, que buscará una salida electoral.",
  },
];

/* ---------- Línea de tiempo ----------
   kind: "main"    → los 14 acontecimientos principales
         "context" → hechos complementarios (se pueden ocultar)
   category: politica | economia | sociedad | violencia
   icon: ver ICONS en app.js
   Campos opcionales de "main": context, detail, impact, quote, note,
   people, link ({ href, label }), image, credit
--------------------------------------- */
const EVENTS = [
  {
    kind: "main",
    year: 1971,
    date: "1971",
    title: "Gran Acuerdo Nacional (GAN)",
    text: "Alejandro Agustín Lanusse impulsa el GAN para organizar una salida electoral, estableciendo condiciones que impedían la candidatura de Perón.",
    context: "El gobierno militar estaba desgastado por el Cordobazo, el Viborazo y la acción de las organizaciones armadas. Lanusse entendía que sin elecciones la crisis iba a empeorar.",
    detail: "El GAN proponía una salida negociada con los partidos políticos: aceptar al peronismo en las elecciones, pero no a Perón. En 1972 se fijó la llamada “cláusula de residencia”: solo podían ser candidatos quienes vivieran en el país antes del 25 de agosto de 1972. Perón vivía en Madrid.",
    impact: "El peronismo aceptó ir a elecciones, pero Perón conservó la conducción: no sería candidato, pero elegiría al candidato.",
    quote: { text: "No le da el cuero.", by: "Lanusse, en julio de 1972, desafiando a Perón a volver al país" },
    people: ["Alejandro Agustín Lanusse", "Juan Domingo Perón"],
    category: "politica",
    icon: "document",
  },
  {
    kind: "context",
    year: 1971,
    date: "Septiembre de 1971",
    title: "Devolución del cuerpo de Eva Perón",
    text: "Como gesto de acercamiento dentro del GAN, el gobierno militar entrega a Perón, en Madrid, el cuerpo de Eva Perón, que había sido secuestrado y ocultado en Europa después del golpe de 1955.",
    category: "politica",
  },
  {
    kind: "context",
    year: 1972,
    date: "22 de agosto de 1972",
    title: "Masacre de Trelew",
    text: "Una semana después de una fuga del penal de Rawson, 16 presos políticos que se habían entregado son fusilados en la Base Aeronaval Almirante Zar, en Trelew. Solo tres sobreviven. El hecho endurece el enfrentamiento entre las organizaciones armadas y el gobierno militar.",
    category: "violencia",
  },
  {
    kind: "main",
    year: 1972,
    date: "17 de noviembre de 1972",
    title: "Operativo Retorno",
    text: "Juan Domingo Perón regresa brevemente a Argentina después de 18 años de exilio.",
    context: "Perón no podía ser candidato por la cláusula de residencia, pero su regreso respondía al desafío de Lanusse y demostraba que seguía siendo el centro de la política argentina.",
    detail: "Llegó a Ezeiza en un vuelo chárter, en un día de lluvia, con un fuerte despliegue militar que impidió que la multitud llegara al aeropuerto. Se instaló en una casa de la calle Gaspar Campos, en Vicente López, adonde llegaban militantes de todo el país. Se reunió con Ricardo Balbín, líder radical, en un gesto de reconciliación entre antiguos adversarios.",
    impact: "Durante esa estadía se formó el FREJULI. A mediados de diciembre Perón volvió a irse del país, después de designar a Héctor J. Cámpora como candidato a presidente.",
    note: "Cada 17 de noviembre el peronismo recuerda esta fecha como el Día de la Militancia.",
    people: ["Juan Domingo Perón", "Ricardo Balbín", "Héctor J. Cámpora"],
    category: "politica",
    icon: "plane",
  },
  {
    kind: "context",
    year: 1972,
    date: "Diciembre de 1972",
    title: "Cámpora, el candidato de Perón",
    text: "El FREJULI proclama la fórmula Héctor J. Cámpora – Vicente Solano Lima. Cámpora, odontólogo y político de larga trayectoria, era el delegado personal de Perón y se lo consideraba un hombre de absoluta lealtad.",
    category: "politica",
  },
  {
    kind: "main",
    year: 1973,
    date: "11 de marzo de 1973",
    title: "Elecciones presidenciales",
    text: "El FREJULI gana las elecciones con aproximadamente el 49,5 % de los votos, bajo el lema “Cámpora al gobierno, Perón al poder”.",
    context: "Por primera vez desde 1951, el peronismo pudo competir por la presidencia con una fórmula propia.",
    detail: "El FREJULI (Frente Justicialista de Liberación) era una alianza encabezada por el Partido Justicialista junto con otras fuerzas, como el desarrollismo de Arturo Frondizi y el conservadorismo popular de Vicente Solano Lima. La UCR, con Ricardo Balbín, quedó segunda con alrededor del 21 %. Como el FREJULI no llegó al 50 % hacía falta una segunda vuelta, pero la UCR desistió de presentarse.",
    impact: "El lema dejaba claro que el verdadero conductor seguía siendo Perón. Muchos entendieron desde el principio que el gobierno de Cámpora sería de transición.",
    people: ["Héctor J. Cámpora", "Vicente Solano Lima", "Ricardo Balbín"],
    category: "politica",
    icon: "ballot",
    stat: "49,5 %",
    link: { href: "#elecciones", label: "Ver comparación de las dos elecciones" },
  },
  {
    kind: "main",
    year: 1973,
    date: "25 de mayo de 1973",
    title: "Asunción de Cámpora y Devotazo",
    text: "Héctor J. Cámpora asume la presidencia. Una movilización popular exige la liberación de presos políticos y se producen liberaciones.",
    context: "Era la primera vez en años que un gobierno surgido de elecciones sin proscripciones asumía el poder. A la ceremonia asistieron los presidentes de Chile, Salvador Allende, y de Cuba, Osvaldo Dorticós.",
    detail: "Esa noche una multitud rodeó la cárcel de Villa Devoto. Cámpora firmó un indulto y, en los días siguientes, el Congreso sancionó una ley de amnistía. Cientos de presos políticos, muchos de ellos militantes de organizaciones armadas, recuperaron la libertad.",
    impact: "Comenzó la llamada “primavera camporista”. La izquierda peronista ganó espacios en el gobierno, en algunas gobernaciones y en las universidades, lo que despertó la desconfianza de la derecha peronista y de los sindicatos.",
    people: ["Héctor J. Cámpora", "Juventud Peronista"],
    category: "sociedad",
    icon: "crowd",
  },
  {
    kind: "main",
    year: 1973,
    date: "30 de mayo de 1973",
    title: "Acta de Compromiso Nacional",
    text: "Se inicia el Pacto Social y el plan económico impulsado por José Ber Gelbard.",
    context: "El nuevo gobierno heredaba una inflación alta y una fuerte puja entre salarios y precios.",
    detail: "El Acta fue firmada por el gobierno, la CGT (los trabajadores) y la CGE (los empresarios). Se congelaron los precios, se otorgó un aumento salarial general y luego se suspendieron por dos años las negociaciones colectivas de salarios (paritarias).",
    impact: "En los primeros meses la inflación bajó con fuerza. Pero el acuerdo dependía de que todos cumplieran, y esa disciplina se fue debilitando.",
    people: ["José Ber Gelbard", "José Ignacio Rucci", "CGT", "CGE"],
    category: "economia",
    icon: "handshake",
    link: { href: "#pacto", label: "Leer el dossier del Pacto Social" },
  },
  {
    kind: "main",
    year: 1973,
    date: "20 de junio de 1973",
    title: "Regreso definitivo de Perón y Masacre de Ezeiza",
    text: "El regreso de Perón genera una movilización multitudinaria que termina en enfrentamientos entre sectores de la derecha y la izquierda peronista.",
    context: "Una multitud enorme, de cientos de miles de personas, se reunió en los alrededores del aeropuerto de Ezeiza para recibir a Perón.",
    detail: "La organización del acto estaba en manos de la derecha peronista. Grupos armados ubicados en el palco y sus alrededores dispararon contra columnas de la Juventud Peronista y Montoneros. Por los enfrentamientos, el avión de Perón aterrizó en la base aérea de Morón. Las cifras oficiales hablaron de 13 muertos y cientos de heridos; otras estimaciones son mayores y el número exacto nunca se estableció.",
    impact: "Lo que debía ser una fiesta mostró en público la guerra interna del peronismo. Al día siguiente, en un mensaje, Perón se mostró más cerca de los sectores ortodoxos.",
    people: ["Juan Domingo Perón", "Derecha peronista", "Juventud Peronista", "Montoneros"],
    category: "violencia",
    icon: "clash",
    link: { href: "#corrientes", label: "Entender las dos corrientes del peronismo" },
  },
  {
    kind: "main",
    year: 1973,
    date: "13 de julio de 1973",
    title: "Renuncia de Cámpora",
    text: "Cámpora y su vicepresidente renuncian. Raúl Lastiri asume interinamente y convoca nuevas elecciones.",
    context: "Tras Ezeiza, la presión de los sectores ortodoxos contra el gobierno de Cámpora, al que acusaban de estar demasiado cerca de la izquierda peronista, se volvió insostenible.",
    detail: "Por ley correspondía asumir al presidente provisional del Senado, Alejandro Díaz Bialet, pero se encontraba de viaje en el exterior. Asumió entonces el presidente de la Cámara de Diputados, Raúl Lastiri, yerno de José López Rega.",
    impact: "La renuncia abrió el camino para que, esta vez sí, Perón fuera candidato.",
    people: ["Héctor J. Cámpora", "Vicente Solano Lima", "Raúl Lastiri", "José López Rega"],
    category: "politica",
    icon: "door",
  },
  {
    kind: "main",
    year: 1973,
    date: "23 de septiembre de 1973",
    title: "Elecciones presidenciales",
    text: "La fórmula Perón–Isabel Martínez gana las elecciones con aproximadamente el 62 % de los votos.",
    context: "La candidatura a vicepresidenta de su esposa, María Estela Martínez, fue una decisión del propio Perón ante las disputas internas por ese lugar.",
    detail: "La UCR, otra vez con Balbín, obtuvo alrededor del 24 %. Fue uno de los respaldos electorales más amplios de la historia argentina.",
    impact: "Perón llegaba al gobierno con enorme legitimidad, pero también con la tarea de ordenar a un movimiento cada vez más dividido.",
    people: ["Juan Domingo Perón", "María Estela (Isabel) Martínez", "Ricardo Balbín"],
    category: "politica",
    icon: "ballot",
    stat: "62 %",
    link: { href: "#elecciones", label: "Ver comparación de las dos elecciones" },
  },
  {
    kind: "main",
    year: 1973,
    date: "25 de septiembre de 1973",
    title: "Asesinato de José Ignacio Rucci",
    text: "El secretario general de la CGT es asesinado, profundizando las tensiones dentro del peronismo.",
    context: "Rucci era un aliado muy cercano a Perón y una pieza central del Pacto Social: garantizaba que los sindicatos aceptaran el congelamiento de salarios.",
    detail: "Fue asesinado solo dos días después del triunfo electoral de Perón. El crimen fue atribuido a Montoneros, aunque la organización nunca lo reivindicó oficialmente.",
    impact: "La relación entre Perón y la izquierda peronista se deterioró gravemente y la violencia entre los sectores del movimiento se intensificó.",
    people: ["José Ignacio Rucci", "CGT", "Montoneros"],
    category: "violencia",
    icon: "ribbon",
  },
  {
    kind: "main",
    year: 1973,
    date: "12 de octubre de 1973",
    title: "Tercera presidencia de Perón",
    text: "Juan Domingo Perón asume nuevamente la presidencia de Argentina.",
    context: "Perón ya había sido presidente entre 1946 y 1955. Volvía al poder después de 18 años de exilio y proscripción.",
    detail: "Su gobierno buscó sostener el Pacto Social y presentó el Plan Trienal. En lo político, se apoyó cada vez más en los sindicatos y en los sectores ortodoxos, mientras López Rega, ministro de Bienestar Social, ganaba influencia.",
    impact: "La izquierda peronista fue perdiendo espacios dentro del gobierno y del movimiento.",
    people: ["Juan Domingo Perón", "María Estela (Isabel) Martínez", "José López Rega"],
    category: "politica",
    icon: "sash",
  },
  {
    kind: "context",
    year: 1973,
    date: "Diciembre de 1973",
    title: "Plan Trienal",
    text: "El gobierno presenta el Plan Trienal para la Reconstrucción y la Liberación Nacional (1974–1977), que buscaba ordenar a largo plazo la política económica iniciada con el Pacto Social.",
    category: "economia",
  },
  {
    kind: "main",
    year: 1974,
    date: "Enero de 1974",
    title: "Triple A",
    text: "La Triple A, organización parapolicial de extrema derecha vinculada a José López Rega, comienza a operar clandestinamente.",
    context: "La Alianza Anticomunista Argentina actuaba en secreto, pero con recursos y protección provenientes del Estado.",
    detail: "Amenazaba, secuestraba y asesinaba a militantes de izquierda, dirigentes, abogados, intelectuales y artistas. Sus víctimas incluían tanto a peronistas de izquierda como a militantes no peronistas.",
    impact: "La violencia política sumó un actor clandestino que operaba desde dentro del aparato estatal, lo que agravó el clima de miedo y enfrentamiento.",
    note: "Algunas investigaciones ubican su primera acción en noviembre de 1973, con el atentado contra el senador radical Hipólito Solari Yrigoyen.",
    people: ["José López Rega"],
    category: "violencia",
    icon: "shadow",
  },
  {
    kind: "context",
    year: 1974,
    date: "Enero de 1974",
    title: "Ataque del ERP en Azul",
    text: "El ERP, organización armada marxista no peronista, ataca un cuartel del Ejército en Azul. Perón responde con dureza: impulsa una reforma del Código Penal y fuerza la renuncia del gobernador bonaerense Oscar Bidegain, cercano a la izquierda peronista.",
    category: "violencia",
  },
  {
    kind: "context",
    year: 1974,
    date: "Febrero de 1974",
    title: "Navarrazo en Córdoba",
    text: "Un levantamiento policial encabezado por el jefe de policía Antonio Navarro desplaza al gobernador Ricardo Obregón Cano y al vicegobernador Atilio López, vinculados a la izquierda peronista. El gobierno nacional interviene la provincia.",
    category: "politica",
  },
  {
    kind: "main",
    year: 1974,
    date: "1 de mayo de 1974",
    title: "Ruptura entre Perón y Montoneros",
    text: "Durante el acto del Día del Trabajador en Plaza de Mayo, Perón critica a los sectores juveniles y los llama “imberbes”. Se produce una ruptura pública.",
    context: "La izquierda peronista reclamaba por el avance de los sectores ortodoxos y de López Rega dentro del gobierno.",
    detail: "Las columnas de Montoneros y la Juventud Peronista cantaron contra el gobierno y contra Isabel. Perón respondió desde el balcón con dureza: los llamó “estúpidos que gritan” e “imberbes”. Las columnas se retiraron y la plaza quedó semivacía.",
    impact: "La tensión que se había visto en Ezeiza se convirtió en una ruptura abierta, a la vista de todos.",
    quote: { text: "¿Qué pasa, General, que está lleno de gorilas el gobierno popular?", by: "Canto de las columnas de la Juventud Peronista y Montoneros" },
    people: ["Juan Domingo Perón", "Montoneros", "Juventud Peronista"],
    category: "sociedad",
    icon: "split",
    link: { href: "#corrientes", label: "Entender las dos corrientes del peronismo" },
  },
  {
    kind: "main",
    year: 1974,
    date: "12 de junio de 1974",
    title: "Último discurso público de Perón",
    text: "Perón realiza uno de sus últimos discursos desde el balcón de la Casa Rosada.",
    context: "El Pacto Social estaba bajo fuerte presión: había desabastecimiento, mercado negro y reclamos salariales.",
    detail: "Ese mismo día, en un mensaje por cadena nacional, Perón denunció presiones contra el acuerdo y dejó entrever que podía dejar el gobierno. La CGT convocó a la Plaza de Mayo para respaldarlo, y allí habló por última vez ante una multitud.",
    impact: "Fue su despedida pública. Pocas semanas después, su salud empeoró.",
    quote: { text: "Yo llevo en mis oídos la más maravillosa música, que para mí es la palabra del pueblo argentino.", by: "Perón, 12 de junio de 1974" },
    people: ["Juan Domingo Perón", "CGT"],
    category: "politica",
    icon: "balcony",
  },
  {
    kind: "main",
    year: 1974,
    date: "1 de julio de 1974",
    title: "Muerte de Perón",
    text: "Juan Domingo Perón fallece y su vicepresidenta, María Estela Martínez de Perón, asume la presidencia.",
    context: "Perón tenía 78 años y su salud se había deteriorado durante los meses de gobierno.",
    detail: "Murió en la residencia de Olivos. Su cuerpo fue velado en el Congreso y miles de personas hicieron filas durante horas bajo la lluvia para despedirlo. Isabel se convirtió en la primera mujer en ejercer la presidencia de la Argentina.",
    impact: "Desapareció la figura que mantenía unido a un movimiento atravesado por conflictos. López Rega ganó todavía más poder dentro del nuevo gobierno.",
    people: ["Juan Domingo Perón", "María Estela Martínez de Perón", "José López Rega"],
    category: "politica",
    icon: "candle",
    link: { href: "#final", label: "Ir a “El final de una etapa”" },
  },
];

/* ---------- Elecciones de 1973 (porcentaje aproximado de votos) ---------- */
const ELECTIONS = [
  {
    id: "marzo",
    label: "11 de marzo de 1973",
    note: "Fórmula ganadora: Cámpora – Solano Lima",
    rows: [
      { party: "FREJULI", detail: "Cámpora – Solano Lima", value: 49.5, series: "frejuli" },
      { party: "UCR", detail: "Balbín – Gamond", value: 21.3, series: "ucr" },
      { party: "Otras fuerzas", detail: "Alianza Popular Federalista, Alianza Popular Revolucionaria y otras", value: 29.2, series: "otros" },
    ],
  },
  {
    id: "septiembre",
    label: "23 de septiembre de 1973",
    note: "Fórmula ganadora: Perón – Isabel Martínez",
    rows: [
      { party: "FREJULI", detail: "Perón – Isabel Martínez", value: 61.9, series: "frejuli" },
      { party: "UCR", detail: "Balbín – De la Rúa", value: 24.4, series: "ucr" },
      { party: "Otras fuerzas", detail: "Alianza Popular Federalista y otras", value: 13.7, series: "otros" },
    ],
  },
];

/* ---------- ¿Quién gobernaba? ---------- */
const PRESIDENTS = [
  { name: "Alejandro A. Lanusse", from: "1971-03-26", to: "1973-05-25", label: "26/3/1971 – 25/5/1973", type: "Gobierno militar", tone: "militar" },
  { name: "Héctor J. Cámpora", from: "1973-05-25", to: "1973-07-13", label: "25/5 – 13/7/1973", type: "Electo (FREJULI)", tone: "electo" },
  { name: "Raúl Lastiri", from: "1973-07-13", to: "1973-10-12", label: "13/7 – 12/10/1973", type: "Interino", tone: "interino" },
  { name: "Juan D. Perón", from: "1973-10-12", to: "1974-07-01", label: "12/10/1973 – 1/7/1974", type: "Electo (FREJULI)", tone: "electo" },
  { name: "María Estela Martínez de Perón", from: "1974-07-01", to: "1974-12-31", label: "Desde el 1/7/1974", type: "Sucesión constitucional", tone: "electo", open: true },
];

/* ---------- Protagonistas ---------- */
const PEOPLE = [
  { name: "Juan Domingo Perón", role: "Líder del peronismo · Presidente 1973–1974", text: "Presidente entre 1946 y 1955, exiliado durante 18 años. Desde Madrid condujo al movimiento y volvió a la presidencia en octubre de 1973.", group: "peronismo" },
  { name: "Alejandro Agustín Lanusse", role: "Presidente de facto 1971–1973", text: "General que encabezó el último tramo de la “Revolución Argentina”. Impulsó el GAN para organizar la salida electoral sin Perón como candidato.", group: "militares" },
  { name: "Héctor J. Cámpora", role: "Presidente mayo–julio 1973", text: "Delegado personal de Perón. Ganó las elecciones de marzo de 1973 y renunció a los 49 días para permitir el regreso de Perón al poder.", group: "peronismo" },
  { name: "María Estela Martínez de Perón", role: "Vicepresidenta y luego presidenta", text: "Conocida como Isabel, tercera esposa de Perón. Fue su compañera de fórmula en 1973 y asumió la presidencia tras su muerte.", group: "peronismo" },
  { name: "José López Rega", role: "Ministro de Bienestar Social", text: "Secretario personal de Perón y figura de enorme influencia en el gobierno. Vinculado a la Triple A.", group: "derecha" },
  { name: "José Ber Gelbard", role: "Ministro de Economía", text: "Empresario y dirigente de la CGE. Diseñó el Pacto Social y el plan económico de 1973.", group: "peronismo" },
  { name: "José Ignacio Rucci", role: "Secretario general de la CGT", text: "Dirigente metalúrgico muy cercano a Perón y sostén sindical del Pacto Social. Asesinado en septiembre de 1973.", group: "derecha" },
  { name: "Raúl Lastiri", role: "Presidente interino julio–octubre 1973", text: "Presidente de la Cámara de Diputados y yerno de López Rega. Convocó a las elecciones de septiembre.", group: "derecha" },
  { name: "Ricardo Balbín", role: "Líder de la UCR", text: "Principal figura de la oposición. Segundo en las dos elecciones de 1973, mantuvo una relación de respeto y diálogo con Perón.", group: "oposicion" },
  { name: "Montoneros", role: "Organización armada peronista", text: "Surgida en 1970, fue la organización más poderosa de la izquierda peronista. Reclamaba una “patria socialista” y rompió públicamente con Perón en 1974.", group: "izquierda" },
  { name: "Juventud Peronista (JP)", role: "Agrupación juvenil", text: "Movilizó a miles de jóvenes en la campaña de 1973. Su sector más combativo integraba la llamada “Tendencia Revolucionaria”, cercana a Montoneros.", group: "izquierda" },
  { name: "CGT", role: "Confederación General del Trabajo", text: "Central de los sindicatos. Su conducción, alineada con la ortodoxia peronista, firmó el Pacto Social.", group: "derecha" },
  { name: "CGE", role: "Confederación General Económica", text: "Agrupaba sobre todo a pequeños y medianos empresarios nacionales. Fue la parte empresaria del Pacto Social.", group: "peronismo" },
  { name: "ERP", role: "Ejército Revolucionario del Pueblo", text: "Organización armada marxista, no peronista, brazo armado del PRT. Continuó la lucha armada durante los gobiernos peronistas.", group: "oposicion" },
];

const PEOPLE_GROUPS = {
  peronismo: "Gobierno y conducción",
  derecha: "Derecha peronista / ortodoxia",
  izquierda: "Izquierda peronista / Tendencia",
  militares: "Gobierno militar",
  oposicion: "Fuera del peronismo",
};

/* ---------- Glosario ---------- */
const GLOSSARY = [
  { term: "Proscripción", def: "Prohibición de que un partido o una persona se presente a elecciones. El peronismo estuvo proscripto entre 1955 y 1973." },
  { term: "GAN (Gran Acuerdo Nacional)", def: "Propuesta de Lanusse para una salida electoral negociada con los partidos, con condiciones que dejaban a Perón afuera de la candidatura." },
  { term: "Cláusula de residencia", def: "Condición del GAN: para ser candidato había que residir en el país antes del 25 de agosto de 1972. Impidió la candidatura de Perón en marzo de 1973." },
  { term: "FREJULI", def: "Frente Justicialista de Liberación. Alianza electoral encabezada por el peronismo que ganó las dos elecciones de 1973." },
  { term: "Devotazo", def: "Movilización del 25 de mayo de 1973 frente a la cárcel de Villa Devoto para exigir la liberación de los presos políticos." },
  { term: "Pacto Social", def: "Acuerdo entre el gobierno, la CGT y la CGE para congelar precios y salarios y frenar la inflación. Se inició con el Acta de Compromiso Nacional." },
  { term: "Paritarias", def: "Negociaciones colectivas entre sindicatos y empresarios para fijar salarios. El Pacto Social las suspendió por dos años." },
  { term: "Inflación", def: "Aumento general y sostenido de los precios. Reduce el poder de compra de los salarios." },
  { term: "Ortodoxia peronista", def: "Sectores tradicionales del peronismo, con fuerte peso sindical, opuestos a la izquierda del movimiento. Su consigna era la “patria peronista”." },
  { term: "Tendencia Revolucionaria", def: "Conjunto de la izquierda peronista: Montoneros, FAR, sectores de la Juventud Peronista. Su consigna era la “patria socialista”." },
  { term: "Organización parapolicial", def: "Grupo armado que actúa de forma clandestina, por fuera de la ley, pero con apoyo o protección de fuerzas o funcionarios del Estado. Por ejemplo, la Triple A." },
  { term: "Gobierno de facto", def: "Gobierno que llega al poder por la fuerza, sin elecciones, como los de la “Revolución Argentina” (1966–1973)." },
  { term: "Imberbes", def: "Literalmente, “sin barba”. Perón usó la palabra el 1 de mayo de 1974 para descalificar a los jóvenes de Montoneros y la JP." },
  { term: "Gorila", def: "Término usado por los peronistas para referirse a los antiperonistas." },
];

/* ---------- Repaso: preguntas con respuesta ---------- */
const QUIZ = [
  {
    q: "¿Qué condición del GAN impidió que Perón fuera candidato en marzo de 1973?",
    options: ["Una edad máxima para los candidatos", "La cláusula de residencia", "La prohibición de los partidos políticos", "Un acuerdo con la UCR"],
    answer: 1,
    why: "Solo podían ser candidatos quienes residieran en el país antes del 25 de agosto de 1972, y Perón vivía en Madrid.",
  },
  {
    q: "¿Qué significaba el lema “Cámpora al gobierno, Perón al poder”?",
    options: ["Que Cámpora y Perón gobernarían juntos", "Que Cámpora sería presidente pero el verdadero conductor era Perón", "Que Perón sería vicepresidente", "Que Cámpora iba a enfrentar a Perón"],
    answer: 1,
    why: "Perón no podía ser candidato, así que Cámpora, su delegado, ocupaba su lugar en la fórmula.",
  },
  {
    q: "¿Quiénes firmaron el Acta de Compromiso Nacional que dio inicio al Pacto Social?",
    options: ["El gobierno, la CGT y la CGE", "El gobierno y las Fuerzas Armadas", "La UCR y el peronismo", "Montoneros y la CGT"],
    answer: 0,
    why: "El acuerdo reunía al Estado, a los trabajadores (CGT) y a los empresarios (CGE).",
  },
  {
    q: "¿Cuál fue la medida central del Pacto Social?",
    options: ["Devaluar la moneda", "Congelar precios y salarios", "Privatizar empresas públicas", "Eliminar los impuestos"],
    answer: 1,
    why: "Se congelaron los precios, se dio un aumento salarial general y se suspendieron las paritarias por dos años.",
  },
  {
    q: "¿Qué quedó expuesto en la Masacre de Ezeiza?",
    options: ["Un enfrentamiento entre peronistas y radicales", "La oposición de los militares al regreso de Perón", "El enfrentamiento entre la derecha y la izquierda peronista", "Un conflicto entre la CGT y la CGE"],
    answer: 2,
    why: "Grupos de la derecha peronista dispararon contra columnas de la Juventud Peronista y Montoneros.",
  },
  {
    q: "¿Quién asumió la presidencia tras la renuncia de Cámpora?",
    options: ["Ricardo Balbín", "José López Rega", "Raúl Lastiri", "Isabel Martínez"],
    answer: 2,
    why: "Lastiri, presidente de la Cámara de Diputados, asumió de forma interina y convocó a nuevas elecciones.",
  },
  {
    q: "¿Con qué porcentaje aproximado ganó la fórmula Perón–Isabel en septiembre de 1973?",
    options: ["49,5 %", "55 %", "62 %", "75 %"],
    answer: 2,
    why: "Cerca del 62 %, un respaldo mayor que el obtenido por Cámpora en marzo.",
  },
  {
    q: "¿Con qué organización se vinculaba a José López Rega?",
    options: ["Montoneros", "La Triple A", "El ERP", "La CGE"],
    answer: 1,
    why: "La Triple A era una organización parapolicial de extrema derecha vinculada a López Rega.",
  },
  {
    q: "¿A quiénes llamó Perón “imberbes” el 1 de mayo de 1974?",
    options: ["A los dirigentes sindicales", "A los militares", "A los jóvenes de Montoneros y la JP", "A los diputados radicales"],
    answer: 2,
    why: "Fue la ruptura pública entre Perón y la izquierda peronista.",
  },
];

/* ---------- Preguntas para pensar (sin respuesta única) ---------- */
const THINK = [
  "¿Por qué crees que Lanusse aceptó al peronismo en las elecciones pero no a Perón como candidato?",
  "El Pacto Social necesitaba que trabajadores y empresarios renunciaran a algo. ¿Qué cedía cada uno y por qué era difícil sostenerlo?",
  "¿Cómo se relacionan la Masacre de Ezeiza, el asesinato de Rucci y la ruptura del 1 de mayo de 1974?",
  "¿Qué papel cumplía Perón dentro de un movimiento con sectores tan enfrentados? ¿Qué cambió con su muerte?",
  "¿Por qué la existencia de una organización como la Triple A, vinculada al propio Estado, es especialmente grave para una democracia?",
];

/* ---------- Para profundizar ---------- */
const SOURCES = [
  { title: "La política en suspenso, 1966–1976", author: "Liliana De Riz", note: "Panorama político del período." },
  { title: "Historia de la Argentina, 1955–2010", author: "Marcos Novaro", note: "Síntesis general, útil para el contexto." },
  { title: "Ezeiza", author: "Horacio Verbitsky", note: "Investigación periodística sobre el 20 de junio de 1973." },
  { title: "Soldados de Perón. Historia crítica sobre los Montoneros", author: "Richard Gillespie", note: "Sobre la izquierda peronista armada." },
];
