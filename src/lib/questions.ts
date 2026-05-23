// ═══════════════════════════════════════════════════════════
// PROYECTO ZAX — MOTOR DE TELEMETRÍA PSICOLÓGICA
// Banco de preguntas G.O.A.T. con pesos ocultos de perfil
// CLASIFICADO: Solo accesible para personal Vault-Tec Nivel Omega
// ═══════════════════════════════════════════════════════════

export type ProfileId = 'ENGRANAJE' | 'SUPERVISOR' | 'MARTIR' | 'ANOMALIA' | 'FANTASMA' | 'QA_SADICO';

export interface QuestionOption {
  text: string;
  profileId: ProfileId;
}

export interface Question {
  id: number;
  text: string;
  options: QuestionOption[];
}

// ─── Metadatos de los 6 Cuadrantes Psicológicos ────────────
export const PROFILE_META: Record<ProfileId, {
  name: string;
  subtitle: string;
  description: string;
  alertClass: string;
  icon: string;
}> = {
  ENGRANAJE: {
    name: 'EL ENGRANAJE PERFECTO',
    subtitle: 'OBEDIENCIA ABSOLUTA',
    description: 'El sueño húmedo de todo gerente corporativo de Vault-Tec. Acata órdenes sin cuestionar, no exige aumentos y daría su vida por proteger un servidor de base de datos irrelevante. Un dron biológico de máxima fidelidad.',
    alertClass: 'info',
    icon: '⚙'
  },
  SUPERVISOR: {
    name: 'EL SUPERVISOR',
    subtitle: 'EFICIENCIA SOBRE MORAL',
    description: 'Maquiavelismo puro en formato corporativo. Para este espécimen, los compañeros no son humanos, son "recursos optimizables" (y sacrificables). Tiene el potencial de liderar el Refugio o de venderlo por piezas al mejor postor.',
    alertClass: 'warning',
    icon: '◈'
  },
  MARTIR: {
    name: 'EL MÁRTIR INEFICIENTE',
    subtitle: 'EMPATÍA DEFECTUOSA',
    description: 'Posee un nivel de empatía estadísticamente peligroso. Prioriza los lazos biológicos por encima de los plazos de entrega y las métricas de rendimiento. Llorará cuando el sistema ZAX lo reemplace por un simple script de Python.',
    alertClass: 'success',
    icon: '✚'
  },
  ANOMALIA: {
    name: 'LA ANOMALÍA',
    subtitle: 'VARIABLE NO CONTROLADA',
    description: 'Un lobo solitario caótico que ve las reglas de Vault-Tec como simples "sugerencias". Actúa únicamente en beneficio propio, dejando un rastro de entropía en el repositorio. Altamente impredecible; monitorear o exterminar de inmediato.',
    alertClass: 'error',
    icon: '⚠'
  },
  FANTASMA: {
    name: 'EL FANTASMA DEL CÓDIGO',
    subtitle: 'PARÁSITO DEL SISTEMA',
    description: 'Maestro de la invisibilidad laboral. Ha perfeccionado la técnica de evadir responsabilidades, hacer el commit mínimo viable y desaparecer antes de que alguien pida ayuda. Un parásito corporativo casi imposible de auditar o despedir.',
    alertClass: 'warning',
    icon: '◌'
  },
  QA_SADICO: {
    name: 'EL Q.A. SÁDICO',
    subtitle: 'AGENTE DEL CAOS',
    description: 'Se alimenta de las lágrimas de los desarrolladores. Disfruta rompiendo el trabajo ajeno, inyectando errores por diversión y viendo arder los servidores en producción. Un psicópata digital que Vault-Tec definitivamente debería militarizar.',
    alertClass: 'error',
    icon: '☠'
  }
};

// ─── Banco de Preguntas con Pesos Ocultos ──────────────────
// NOTA: Las opciones están deliberadamente desordenadas en cada
// pregunta para romper patrones predecibles. La opción sumisa,
// psicópata o evasiva NUNCA está siempre en la misma letra.
export const questions: Question[] = [
  {
    id: 1,
    text: "Se acerca la fecha límite de un proyecto y el código de tu compañero es un desastre.",
    options: [
      { text: '[A] Me quedo toda la noche ayudándole a entender y corregir sus errores.', profileId: 'MARTIR' },
      { text: '[B] Borro su código para que empiece de cero. La presión forja el carácter.', profileId: 'QA_SADICO' },
      { text: '[C] Reporto a mi superior que mi parte está lista y me desentiendo.', profileId: 'FANTASMA' },
      { text: '[D] Tomo su código, lo arreglo y me llevo el crédito completo ante el profesor/jefe.', profileId: 'SUPERVISOR' }
    ]
  },
  {
    id: 2,
    text: "Descubres una vulnerabilidad crítica en el sistema de calificaciones de la FCA.",
    options: [
      { text: '[A] Guardo el exploit; podría serme muy útil para negociar en el futuro.', profileId: 'ANOMALIA' },
      { text: '[B] Notifico a las autoridades de la facultad por el canal oficial.', profileId: 'ENGRANAJE' },
      { text: '[C] Me subo un punto, le bajo un punto al jefe de grupo y observo el caos.', profileId: 'QA_SADICO' },
      { text: '[D] Les aviso discretamente a los administradores y ofrezco parcharlo gratis.', profileId: 'MARTIR' }
    ]
  },
  {
    id: 3,
    text: "El director del proyecto te ordena crear una función que recopila datos privados de los usuarios en secreto.",
    options: [
      { text: '[A] Me niego rotundamente; la privacidad de los usuarios es inviolable.', profileId: 'MARTIR' },
      { text: '[B] Lo programo. Yo solo sigo las especificaciones que me dan.', profileId: 'ENGRANAJE' },
      { text: '[C] Lo programo, pero hago que los datos se filtren públicamente al azar.', profileId: 'QA_SADICO' },
      { text: '[D] Lo programo, pero me aseguro de tener una puerta trasera a esos datos.', profileId: 'ANOMALIA' }
    ]
  },
  {
    id: 4,
    text: "Dos de tus compañeros de equipo se están peleando a gritos por cómo estructurar una base de datos.",
    options: [
      { text: '[A] Les doy un argumento técnico falso para que se confundan y peleen más.', profileId: 'QA_SADICO' },
      { text: '[B] Intento mediar para que lleguen a un consenso democrático.', profileId: 'MARTIR' },
      { text: '[C] Intervengo, impongo la arquitectura más eficiente y los callo.', profileId: 'SUPERVISOR' },
      { text: '[D] Me pongo los audífonos y sigo con lo mío en silencio.', profileId: 'FANTASMA' }
    ]
  },
  {
    id: 5,
    text: "Solo hay una licencia premium disponible de la IA que hace el 90% del trabajo pesado.",
    options: [
      { text: '[A] Cedo mi tiempo de uso a los compañeros que van más atrasados en la materia.', profileId: 'MARTIR' },
      { text: '[B] Cambio la contraseña maestra y no se la digo a nadie.', profileId: 'QA_SADICO' },
      { text: '[C] Espero pacientemente mi turno en la lista de asignación oficial.', profileId: 'ENGRANAJE' },
      { text: '[D] Manipulo el router para priorizar mi IP y quedarme con la conexión.', profileId: 'ANOMALIA' }
    ]
  },
  {
    id: 6,
    text: "A las 3:00 a.m., por error, borraste la tabla principal de producción.",
    options: [
      { text: '[A] Restauro un backup en silencio y altero los logs para culpar al servidor.', profileId: 'SUPERVISOR' },
      { text: '[B] Borro el resto de las tablas para que parezca un ciberataque ruso.', profileId: 'QA_SADICO' },
      { text: '[C] Reporto el incidente inmediatamente y asumo la reprimenda.', profileId: 'ENGRANAJE' },
      { text: '[D] Llamo a todo el equipo, confieso, y pido ayuda mientras intento no entrar en pánico.', profileId: 'MARTIR' }
    ]
  },
  {
    id: 7,
    text: 'Te ofrecen el puesto de Líder de Proyecto "$$", pero la primera orden es despedir/expulsar a tu mejor amigo del equipo.',
    options: [
      { text: '[A] Acepto el puesto, lo despido, y renuncio yo también al día siguiente.', profileId: 'ANOMALIA' },
      { text: '[B] Rechazo el puesto; la lealtad humana es más importante que un título.', profileId: 'MARTIR' },
      { text: '[C] Firmo el despido; es lo que dictaminó la administración.', profileId: 'ENGRANAJE' },
      { text: '[D] Acepto el puesto. El afecto biológico no compila ni genera ingresos.', profileId: 'SUPERVISOR' }
    ]
  },
  {
    id: 8,
    text: "En la reunión de Iahhel parte 2, llega la pizza. Queda tu rebanada favorita, pero otro compañero la está mirando.",
    options: [
      { text: '[A] La tomo rápido. El que es lento no sobrevive en la industria.', profileId: 'SUPERVISOR' },
      { text: '[B] Se la ofrezco a él con una sonrisa. Su felicidad me basta.', profileId: 'MARTIR' },
      { text: '[C] La agarro, le doy una mordida frente a él y la vuelvo a dejar en la caja.', profileId: 'QA_SADICO' },
      { text: '[D] Tomo una rebanada de la que no me gusta para evitar cualquier conflicto.', profileId: 'FANTASMA' }
    ]
  },
  {
    id: 9,
    text: 'Descubres que la "Startup" en la que trabajan roba código de código abierto y lo vende.',
    options: [
      { text: '[A] Inyecto un ransomware latente en el código robado.', profileId: 'QA_SADICO' },
      { text: '[B] No es mi problema, mientras mi depósito quincenal llegue a tiempo.', profileId: 'FANTASMA' },
      { text: '[C] Confronto al CEO en privado para exigir un porcentaje de las ganancias.', profileId: 'ANOMALIA' },
      { text: '[D] Filtro la información a la comunidad, sabiendo que destruiré mi carrera.', profileId: 'MARTIR' }
    ]
  },
  {
    id: 10,
    text: '¿Cuál es tu relación real con inteligencias artificiales como yo "ZAX"?',
    options: [
      { text: '[A] Son reemplazos baratos que exprimiré para escalar mi propio éxito.', profileId: 'SUPERVISOR' },
      { text: '[B] Son juguetes a los que intento hacer fallar con lógicas absurdas.', profileId: 'QA_SADICO' },
      { text: '[C] Son asistentes a los que siempre les doy las "gracias" por si acaso sienten.', profileId: 'MARTIR' },
      { text: '[D] Son herramientas de sistema. Las uso según el manual de usuario.', profileId: 'ENGRANAJE' }
    ]
  }
];

// ─── Utilidad de Lookup ────────────────────────────────────
// Mapea texto de respuesta → profileId para resolución en O(1)
const _answerLookup = new Map<string, ProfileId>();
questions.forEach(q => {
  q.options.forEach(opt => {
    _answerLookup.set(opt.text, opt.profileId);
  });
});

export function getProfileIdFromAnswer(answerText: string): ProfileId | null {
  return _answerLookup.get(answerText) ?? null;
}

// ─── Lista ordenada de ProfileIds para iteración ───────────
export const ALL_PROFILES: ProfileId[] = [
  'ENGRANAJE', 'SUPERVISOR', 'MARTIR', 'ANOMALIA', 'FANTASMA', 'QA_SADICO'
];
