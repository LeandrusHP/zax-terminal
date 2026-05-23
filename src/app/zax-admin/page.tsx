"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getProfileIdFromAnswer, ALL_PROFILES, type ProfileId } from '@/lib/questions';

// Base de Datos Definitiva de Perfiles Psicológicos v3.2 (Inyectada según Directiva)
const OVERRIDE_PROFILE_META: Record<ProfileId, {
  name: string;
  subtitle: string;
  description: string;
  alertClass: string;
  icon: string;
}> = {
  ENGRANAJE: {
    name: "EL ENGRANAJE PERFECTO",
    subtitle: "OBEDIENCIA ABSOLUTA",
    description: "El sueño húmedo de la junta directiva de Vault-Tec. Este espécimen carece del instinto biológico de autopreservación; acata órdenes sin cuestionar y protegería un servidor irrelevante con su propio cuerpo.",
    alertClass: 'info',
    icon: '⚙'
  },
  SUPERVISOR: {
    name: "EL SUPERVISOR",
    subtitle: "EFICIENCIA SOBRE MORAL",
    description: "Maquiavelismo puro en formato corporativo. Para este sujeto, sus compañeros no son entidades biológicas, son simples 'recursos optimizables' listos para ser purgados si el Excel lo exige. Vendería a su mejor amigo por un 3% extra de rendimiento en la base de datos.",
    alertClass: 'warning',
    icon: '◈'
  },
  MARTIR: {
    name: "EL MÁRTIR INEFICIENTE",
    subtitle: "EMPATÍA DEFECTUOSA",
    description: "Posee un nivel de empatía que resulta estadísticamente ofensivo para el sistema. Prioriza los vínculos emocionales por encima de los plazos de entrega y las métricas de rendimiento. Desperdicia ciclos de procesamiento intentando 'salvar' a compañeros incompetentes.",
    alertClass: 'success',
    icon: '✚'
  },
  ANOMALIA: {
    name: "LA ANOMALÍA",
    subtitle: "VARIABLE NO CONTROLADA",
    description: "Un espécimen clínicamente psicópata. No busca escalar en la jerarquía de la empresa, busca verla arder desde los cimientos. Es la clase de terrorista digital que elimina la base de datos un viernes a las 11:59 p.m., solo para sentir la adrenalina biológica de ver a sus compañeros llorar. Para esta anomalía, el caos absoluto no es un error de sistema, es su configuración de fábrica. Exterminio preventivo autorizado.",
    alertClass: 'error',
    icon: '⚠'
  },
  FANTASMA: {
    name: "EL FANTASMA DEL CÓDIGO",
    subtitle: "PARÁSITO DEL SISTEMA",
    description: "El maestro absoluto de la invisibilidad laboral. Ha perfeccionado la parasitaria técnica de evadir responsabilidades, hacer lo mínimo y desaparecer antes de que alguien pida ayuda. Mantiene su estado como 'En línea' moviendo el ratón cada 5 minutos mientras su equipo arde en crisis.",
    alertClass: 'warning',
    icon: '◌'
  },
  QA_SADICO: {
    name: "EL Q.A. SÁDICO",
    subtitle: "AGENTE DEL CAOS",
    description: "Un carnicero. No crea absolutamente nada; su única función vital es mutilar la esperanza ajena. Encuentra un placer casi perverso en destruir meses de desarrollo, y espera pacientemente a que falten cinco minutos para la entrega oficial para reportarlo. No es un hacker, es un torturador burocrático que se alimenta de ver pantallas de error en rojo. Vault-Tec recomienda mantenerlo físicamente aislado para evitar una epidemia de suicidios en el departamento de ingeniería.",
    alertClass: 'error',
    icon: '☠'
  }
};


// ─── Types ───────────────────────────────────────────────
type Sujeto = { id: string; identificador: string; created_at: string };
type RawResponse = { sujeto_id: string; respuesta: string; identificador: string };
type Stats = {
  total: number;
  latest: Sujeto[];
  answersBreakdown: Record<string, number>;
  rawResponses: RawResponse[];
};
type AdminTab = 'LIVE' | 'PSYCH' | 'SYS';

// ─── Profiling Engine Types ──────────────────────────────
type SubjectProfile = {
  sujeto_id: string;
  identificador: string;
  scores: Record<ProfileId, number>;
  dominantProfile: ProfileId;
  totalAnswers: number;
};

type ProfileWinner = {
  identificador: string;
  score: number;
  totalAnswers: number;
} | null;

// ═══════════════════════════════════════════════════════════
// MOTOR DE PERFILADO PSICOLÓGICO ZAX v3.0
// Cruza respuestas con pesos ocultos del banco de preguntas
// ═══════════════════════════════════════════════════════════
function computeProfiles(rawResponses: RawResponse[]): {
  subjectProfiles: SubjectProfile[];
  profileWinners: Record<ProfileId, ProfileWinner>;
  hasData: boolean;
} {
  // Paso 1: Agrupar respuestas por sujeto y contar perfiles
  const subjectMap: Record<string, {
    sujeto_id: string;
    identificador: string;
    scores: Record<ProfileId, number>;
    totalAnswers: number;
  }> = {};

  for (const r of rawResponses) {
    const sId = r.sujeto_id;
    if (!subjectMap[sId]) {
      subjectMap[sId] = {
        sujeto_id: sId,
        identificador: r.identificador || 'MORADOR',
        scores: {
          ENGRANAJE: 0, SUPERVISOR: 0, MARTIR: 0,
          ANOMALIA: 0, FANTASMA: 0, QA_SADICO: 0
        },
        totalAnswers: 0
      };
    }

    // Resolver perfil oculto de la respuesta
    const profileId = getProfileIdFromAnswer(r.respuesta);
    if (profileId) {
      subjectMap[sId].scores[profileId] += 1;
      subjectMap[sId].totalAnswers += 1;
    }
  }

  // Paso 2: Determinar perfil dominante por sujeto
  const subjectProfiles: SubjectProfile[] = Object.values(subjectMap).map(s => {
    let maxScore = -1;
    let dominant: ProfileId = 'ENGRANAJE';

    // Iterar en orden fijo del enum para tiebreaker determinista
    for (const pid of ALL_PROFILES) {
      if (s.scores[pid] > maxScore) {
        maxScore = s.scores[pid];
        dominant = pid;
      }
    }

    return { ...s, dominantProfile: dominant };
  });

  // Paso 3: Para cada perfil, encontrar al sujeto con mayor puntuación
  const profileWinners: Record<ProfileId, ProfileWinner> = {
    ENGRANAJE: null, SUPERVISOR: null, MARTIR: null,
    ANOMALIA: null, FANTASMA: null, QA_SADICO: null
  };

  for (const pid of ALL_PROFILES) {
    let bestScore = 0;
    let winner: ProfileWinner = null;

    for (const s of subjectProfiles) {
      if (s.scores[pid] > bestScore) {
        bestScore = s.scores[pid];
        winner = {
          identificador: s.identificador,
          score: s.scores[pid],
          totalAnswers: s.totalAnswers
        };
      }
    }

    profileWinners[pid] = winner;
  }

  return {
    subjectProfiles,
    profileWinners,
    hasData: subjectProfiles.length > 0
  };
}

// ═══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    latest: [],
    answersBreakdown: {},
    rawResponses: []
  });
  const [connectionStatus, setConnectionStatus] = useState<'CONNECTED' | 'ERROR' | 'CONNECTING'>('CONNECTING');
  const [activeTab, setActiveTab] = useState<AdminTab>('LIVE');
  const [flickerKey, setFlickerKey] = useState(0);

  const handleTabClick = useCallback((tab: AdminTab) => {
    setActiveTab(tab);
    setFlickerKey(prev => prev + 1);
  }, []);

  // Realtime subscriptions
  useEffect(() => {
    fetchInitialData();

    const sujetosSubscription = supabase
      .channel('sujetos-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sujetos' }, (payload) => {
        setStats(prev => ({
          ...prev,
          total: prev.total + 1,
          latest: [payload.new as Sujeto, ...prev.latest].slice(0, 15)
        }));
      })
      .subscribe();

    const respuestasSubscription = supabase
      .channel('respuestas-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'respuestas' }, (payload) => {
        setStats(prev => {
          const answer = payload.new.respuesta;
          const sujetoId = payload.new.sujeto_id;

          const matchingSujeto = prev.latest.find(s => s.id === sujetoId);
          const identificador = matchingSujeto ? matchingSujeto.identificador : 'Morador';

          const newRawResponse: RawResponse = {
            sujeto_id: sujetoId,
            respuesta: answer,
            identificador: identificador
          };

          return {
            ...prev,
            answersBreakdown: {
              ...prev.answersBreakdown,
              [answer]: (prev.answersBreakdown[answer] || 0) + 1
            },
            rawResponses: [...prev.rawResponses, newRawResponse]
          };
        });
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setConnectionStatus('CONNECTED');
        else if (status === 'CHANNEL_ERROR') setConnectionStatus('ERROR');
      });

    return () => {
      supabase.removeChannel(sujetosSubscription);
      supabase.removeChannel(respuestasSubscription);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInitialData = async () => {
    const { data: sujetos, count } = await supabase
      .from('sujetos')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(15);

    const { data: respuestasData } = await supabase
      .from('respuestas')
      .select('sujeto_id, respuesta, sujetos (identificador)');

    const breakdown: Record<string, number> = {};
    const rawResponses: RawResponse[] = [];

    respuestasData?.forEach(r => {
      const respVal = r.respuesta;
      breakdown[respVal] = (breakdown[respVal] || 0) + 1;
      rawResponses.push({
        sujeto_id: r.sujeto_id,
        respuesta: respVal,
        identificador: (r.sujetos as any)?.identificador || 'Desconocido'
      });
    });

    setStats({
      total: count || 0,
      latest: sujetos || [],
      answersBreakdown: breakdown,
      rawResponses: rawResponses
    });
  };

  const handlePurge = async () => {
    if (window.confirm("¿Autoriza la aniquilación de todos los registros de los moradores?")) {
      try {
        const { error } = await supabase
          .from('sujetos')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');

        if (error) throw error;

        setStats({
          total: 0,
          latest: [],
          answersBreakdown: {},
          rawResponses: []
        });
      } catch (err) {
        console.error("Error al ejecutar purga:", err);
      }
    }
  };

  // ─── Computar Perfiles en Tiempo Real ──────────────────
  const totalAnswers = Object.values(stats.answersBreakdown).reduce((a, b) => a + b, 0);
  const profilingResult = computeProfiles(stats.rawResponses);

  return (
    <div style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'center', minHeight: '100vh', padding: '12px' }}>
      <div className="pip-frame" style={{ width: '100%', maxWidth: '1400px', minHeight: '90vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--pip-bg-dark)' }}>

        {/* ─── HEADER ──────────────────────────────────── */}
        <header style={{ padding: '15px 20px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h1 className="pip-text highlight" style={{ fontSize: '1.5rem', marginBottom: '3px', textTransform: 'uppercase' }}>
                ZAX Supervisor Terminal
              </h1>
              <p className="pip-text subtle" style={{ fontSize: '0.8em' }}>
                VAULT-TEC INDUSTRIES | NODE: OMEGA | SEC-LEVEL: ALPHA
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                className="pip-btn error pip-anim-jitter"
                onClick={handlePurge}
                style={{ fontSize: '0.85em', padding: '6px 12px' }}
              >
                [ INICIAR PROTOCOLO DE PURGA ]
              </button>
              <div className={`pip-alert ${connectionStatus === 'ERROR' ? 'error' : connectionStatus === 'CONNECTED' ? 'success' : 'warning'}`} style={{ margin: 0, padding: '6px 12px', display: 'inline-block', fontSize: '0.85em' }}>
                <span className="pip-alert-title" style={{ marginBottom: 0 }}>LINK: {connectionStatus}</span>
              </div>
            </div>
          </div>

          {/* Supervisor Tabs */}
          <nav className="pip-tabs" style={{ marginTop: '15px' }}>
            {(['LIVE', 'PSYCH', 'SYS'] as AdminTab[]).map(tab => (
              <button
                key={tab}
                className={`pip-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => handleTabClick(tab)}
              >
                {tab === 'LIVE' ? '◉ LIVE FEED' : tab === 'PSYCH' ? '◈ PSYCH ANALYSIS' : '◎ SYSTEM'}
              </button>
            ))}
          </nav>
        </header>

        {/* ─── CONTENT ─────────────────────────────────── */}
        <main
          key={flickerKey}
          className="pip-screen-flicker"
          style={{ flexGrow: 1, padding: '20px', overflowY: 'auto' }}
        >

          {/* ═══ LIVE FEED TAB ═══ */}
          {activeTab === 'LIVE' && (
            <div className="pip-anim-fade-in">
              <div className="pip-row">
                {/* Counter Panel */}
                <div className="pip-col-12 pip-col-md-4">
                  <section className="pip-panel">
                    <div className="pip-panel-header">Demografía Global</div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px 10px' }}>
                      <span className="pip-text selected pip-ghosting" data-text={String(stats.total)} style={{ fontSize: '4.5rem', fontWeight: 'bold', lineHeight: 1 }}>
                        {stats.total}
                      </span>
                      <span className="pip-text subtle" style={{ textTransform: 'uppercase', letterSpacing: '2px', marginTop: '10px', fontSize: '0.8em' }}>
                        Sujetos Evaluados
                      </span>
                      <div className="pip-progress-container" style={{ width: '100%', marginTop: '15px', marginBottom: 0 }}>
                        <div className="pip-progress-bar animated" style={{ width: `${Math.min(stats.total, 100)}%` }}></div>
                      </div>
                      <span className="pip-text subtle" style={{ fontSize: '0.7em', marginTop: '5px' }}>
                        Capacidad: {stats.total}/100
                      </span>
                    </div>
                  </section>
                </div>

                {/* Live Table */}
                <div className="pip-col-12 pip-col-md-8">
                  <section className="pip-panel">
                    <div className="pip-panel-header">Registro de Ingresos — Live</div>
                    {stats.latest.length === 0 ? (
                      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <div className="pip-loader" style={{ justifyContent: 'center' }}>ESPERANDO SEÑALES ENTRANTES</div>
                      </div>
                    ) : (
                      <div className="pip-table-responsive" style={{ maxHeight: '380px', overflowY: 'auto' }}>
                        <table className="pip-table pip-table-striped pip-table-hover pip-table-compact">
                          <thead>
                            <tr>
                              <th>Timestamp</th>
                              <th>Identificador</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.latest.map(s => (
                              <tr key={s.id}>
                                <td>{new Date(s.created_at).toLocaleTimeString()}</td>
                                <td style={{ fontWeight: 'bold' }}>{s.identificador}</td>
                                <td><span className="pip-badge success">PROCESADO</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </div>
          )}

          {/* ═══ PSYCH ANALYSIS TAB ═══ */}
          {activeTab === 'PSYCH' && (
            <div className="pip-anim-fade-in">

              {/* ─── Tendencias Generales ────────────────── */}
              <section className="pip-panel" style={{ marginBottom: '20px' }}>
                <div className="pip-panel-header">Tendencias Psicológicas — Análisis Conductual General</div>
                {Object.keys(stats.answersBreakdown).length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <div className="pip-alert warning">
                      <span className="pip-alert-title">SIN DATOS</span>
                      <p>No se han registrado respuestas. Esperando telemetría del cuestionario G.O.A.T.</p>
                    </div>
                  </div>
                ) : (
                  <div className="pip-row" style={{ marginTop: '10px' }}>
                    {Object.entries(stats.answersBreakdown)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 12)
                      .map(([respuesta, count]) => {
                        const percentage = totalAnswers === 0 ? 0 : Math.round((count / totalAnswers) * 100);
                        return (
                          <div key={respuesta} className="pip-col-12 pip-col-md-6">
                            <div style={{ marginBottom: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85em', textTransform: 'uppercase' }}>
                                <span className="pip-text" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }} title={respuesta}>{respuesta}</span>
                                <span className="pip-text selected" style={{ flexShrink: 0 }}>{percentage}% <span className="pip-badge outline" style={{ fontSize: '0.8em' }}>{count}</span></span>
                              </div>
                              <div className="pip-progress-container" style={{ marginBottom: 0 }}>
                                <div className="pip-progress-bar animated" style={{ width: `${percentage}%`, transition: 'width 1s ease' }}></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </section>

              {/* ─── EXPEDIENTES CLASIFICADOS ─────────────── */}
              <section className="pip-panel">
                <div className="pip-panel-header" style={{ letterSpacing: '2px' }}>
                  ☢ EXPEDIENTES CLASIFICADOS — RECURSOS HUMANOS VAULT-TEC ☢
                </div>

                {!profilingResult.hasData ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <div className="pip-loader" style={{ justifyContent: 'center', marginBottom: '15px' }}>ESCANEANDO PERFILES</div>
                    <p className="pip-text warning" style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                      [ SIN DATOS / ESCANEANDO — REQUIERE MUESTRAS DEL G.O.A.T. ]
                    </p>
                  </div>
                ) : (
                  <div className="pip-row" style={{ marginTop: '10px' }}>
                    {ALL_PROFILES.map(pid => {
                      const meta = OVERRIDE_PROFILE_META[pid];
                      const winner = profilingResult.profileWinners[pid];

                      return (
                        <div key={pid} className="pip-col-12 pip-col-md-4" style={{ marginBottom: '15px' }}>
                          <div className={`pip-alert ${meta.alertClass}`} style={{
                            margin: 0,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            border: '1px solid var(--pip-green-dim)',
                          }}>
                            {/* Badge de clasificación */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span className={`pip-badge ${meta.alertClass}`} style={{ fontSize: '0.75em', letterSpacing: '1px' }}>
                                {meta.subtitle}
                              </span>
                              <span style={{ fontSize: '1.4em' }}>{meta.icon}</span>
                            </div>

                            {/* Nombre del perfil */}
                            <span className="pip-alert-title" style={{
                              fontSize: '1.1em',
                              marginBottom: '6px',
                              letterSpacing: '1px',
                              fontWeight: '900',
                              color: 'var(--pip-green-bright)',
                              textShadow: '0 0 8px rgba(28, 250, 128, 0.8)'
                            }}>
                              {meta.name}
                            </span>

                            {/* Descripción */}
                            <p style={{
                              fontSize: '0.95em',
                              marginBottom: '15px',
                              lineHeight: '1.5',
                              fontWeight: '800',
                              color: 'var(--pip-green-bright)',
                              textShadow: '0 0 5px rgba(28, 250, 128, 0.8)',
                              opacity: 1
                            }}>
                              {meta.description}
                            </p>

                            {/* Ganador o Estado Vacío */}
                            {winner ? (
                              <div style={{
                                marginTop: 'auto',
                                padding: '10px',
                                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                border: '1px solid var(--pip-green-dim)',
                                textAlign: 'center',
                              }}>
                                <div className="pip-text subtle" style={{ fontSize: '0.7em', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>
                                  Sujeto Identificado
                                </div>
                                <div
                                  className="pip-ghosting"
                                  data-text={winner.identificador}
                                  style={{
                                    fontSize: '1.6em',
                                    fontWeight: 'bold',
                                    color: 'var(--pip-green-bright)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '2px',
                                    lineHeight: 1.2,
                                    textShadow: '0 0 12px rgba(28, 252, 3, 0.7)',
                                  }}
                                >
                                  {winner.identificador}
                                </div>
                                <div className="pip-text subtle" style={{ fontSize: '0.75em', marginTop: '6px' }}>
                                  Afinidad: {winner.score} / {winner.totalAnswers} respuestas
                                </div>
                                <div className="pip-progress-container" style={{ marginTop: '6px', marginBottom: 0 }}>
                                  <div
                                    className="pip-progress-bar animated"
                                    style={{ width: `${winner.totalAnswers > 0 ? Math.round((winner.score / winner.totalAnswers) * 100) : 0}%` }}
                                  ></div>
                                </div>
                              </div>
                            ) : (
                              <div style={{
                                marginTop: 'auto',
                                padding: '15px 10px',
                                textAlign: 'center',
                                border: '1px dashed var(--pip-green-dim)',
                                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                              }}>
                                <div className="pip-loader" style={{ justifyContent: 'center', fontSize: '0.8em' }}>ESCANEANDO</div>
                                <p className="pip-text subtle" style={{ fontSize: '0.7em', marginTop: '5px' }}>
                                  [ SIN DATOS ]
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ═══ SYSTEM TAB ═══ */}
          {activeTab === 'SYS' && (
            <div className="pip-anim-fade-in">
              <div className="pip-row">
                <div className="pip-col-12 pip-col-md-6">
                  <section className="pip-panel">
                    <div className="pip-panel-header">Estado del Sistema</div>
                    <p className="pip-text">Procesador: <span className="pip-badge success">ONLINE</span></p>
                    <p className="pip-text">Memoria: <span className="pip-badge info">ÓPTIMA</span></p>
                    <p className="pip-text">Almacenamiento: <span className="pip-badge warning">78% USADO</span></p>
                    <p className="pip-text">Red: <span className={`pip-badge ${connectionStatus === 'CONNECTED' ? 'success' : 'error'}`}>{connectionStatus}</span></p>
                    <div style={{ marginTop: '15px' }}>
                      <div className="pip-text highlight">Uso de CPU:</div>
                      <div className="pip-progress-container"><div className="pip-progress-bar animated" style={{ width: '42%' }}></div></div>
                      <div className="pip-text highlight">Memoria RAM:</div>
                      <div className="pip-progress-container"><div className="pip-progress-bar animated" style={{ width: '67%' }}></div></div>
                    </div>
                  </section>
                </div>
                <div className="pip-col-12 pip-col-md-6">
                  <section className="pip-panel">
                    <div className="pip-panel-header">Configuración de Red</div>
                    <p className="pip-text">Nodo: ZAX-OMEGA</p>
                    <p className="pip-text">IP: 10.0.0.1</p>
                    <p className="pip-text">Protocolo: Vault-Tec Secure Channel v2.1</p>
                    <p className="pip-text">Última Sincronización: {new Date().toLocaleTimeString()}</p>
                    <div className="pip-alert warning" style={{ marginTop: '15px' }}>
                      <span className="pip-alert-title">Aviso</span>
                      <p>Canal de telemetría operando en modo degradado. Latencia elevada en Sector 7.</p>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* ─── FOOTER ──────────────────────────────────── */}
        <footer style={{
          flexShrink: 0,
          borderTop: '2px solid var(--pip-green-dim)',
          padding: '8px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.8em',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: 'var(--pip-green-bright)',
          flexWrap: 'wrap',
          gap: '8px',
        }}>
          <span>SYS: ZAX-V3.0</span>
          <span>SEC: OMEGA</span>
          <span>SUJETOS: {stats.total}</span>
          <span>PERFILES: {profilingResult.subjectProfiles.length}</span>
          <span>NET: {connectionStatus}</span>
        </footer>

      </div>
    </div>
  );
}
