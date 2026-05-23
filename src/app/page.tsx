"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { questions } from '@/lib/questions';

// ─── Types ───────────────────────────────────────────────
type ActiveTab = 'STAT' | 'INV' | 'DATA' | 'MAP' | 'RADIO';
type Step = 'loading' | 'identifier' | 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7' | 'q8' | 'q9' | 'q10' | 'submitting' | 'success';



// ─── Simulated Tab Content ──────────────────────────────
function StatScreen() {
  return (
    <div className="pip-anim-fade-in">
      <div className="pip-alert warning">
        <span className="pip-alert-title pip-ghosting" data-text="ESTADO DEL SISTEMA: INESTABLE">ESTADO DEL SISTEMA: INESTABLE</span>
        <p className="pip-typewriter">Anomalías detectadas en el controlador CRT. Compensación de parpadeo activa.</p>
      </div>
      <div className="pip-row">
        <div className="pip-col-12 pip-col-md-6">
          <section className="pip-panel">
            <div className="pip-panel-header">Signos Vitales</div>
            <div className="pip-text highlight">SALUD: <span className="pip-badge success">NOMINAL</span></div>
            <div className="pip-progress-container"><div className="pip-progress-bar" style={{ width: '95%' }}></div></div>
            <div className="pip-text highlight">STAMINA: <span className="pip-badge info">LISTO</span></div>
            <div className="pip-progress-container"><div className="pip-progress-bar animated" style={{ width: '65%' }}></div></div>
            <div style={{ marginTop: '15px' }}><div className="pip-loader">SINCRONIZANDO</div></div>
          </section>
        </div>
        <div className="pip-col-12 pip-col-md-6">
          <article className="pip-card">
            <span className="pip-card-title">Alerta de Peligro</span>
            <p className="pip-text warning">Interferencia ambiental en aumento. Escaneo del sector activo.</p>
          </article>
          <div className="pip-alert error">
            <span className="pip-alert-title">ERROR DE SISTEMA</span>
            <p>Depleción del núcleo inminente. Sector 7 fuera de línea.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InvScreen() {
  return (
    <div className="pip-anim-fade-in">
      <section className="pip-panel">
        <div className="pip-panel-header">Inventario del Morador</div>
        <div className="pip-table-responsive">
          <table className="pip-table pip-table-striped pip-table-compact">
            <thead>
              <tr>
                <th>Item</th><th>Tipo</th><th>Peso</th><th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Pistola Láser</td><td>ARMA</td><td>3.5</td><td><span className="pip-badge info">Equipado</span></td></tr>
              <tr><td>Med-Kit (10)</td><td>AYUDA</td><td>0.0</td><td><span className="pip-badge success">Listo</span></td></tr>
              <tr><td>De-Tox (5)</td><td>AYUDA</td><td>0.0</td><td><span className="pip-badge success">Listo</span></td></tr>
              <tr><td>Munición (250)</td><td>MUNI</td><td>0.8</td><td><span className="pip-badge">Disponible</span></td></tr>
              <tr><td>Traje Técnico</td><td>EQUIP</td><td>1.0</td><td><span className="pip-badge info">Equipado</span></td></tr>
              <tr><td>Granada (3)</td><td>EXPL</td><td>0.5</td><td><span className="pip-badge warning">Volátil</span></td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function RadioScreen() {
  return (
    <div className="pip-anim-fade-in">
      <section className="pip-panel">
        <div className="pip-panel-header">Señales de Radio</div>
        <div className="pip-alert error">
          <span className="pip-alert-title">SIN SEÑAL</span>
          <p>No se detectan frecuencias de radio activas en este sector.</p>
        </div>
        <div className="pip-text" style={{ marginTop: '15px' }}>
          <div className="pip-loader">ESCANEANDO FRECUENCIAS</div>
        </div>
        <div style={{ marginTop: '20px' }}>
          <p className="pip-text subtle">Última frecuencia conocida: 87.5 FM — Vault-Tec Emergency Broadcast</p>
          <p className="pip-text subtle">Potencia de señal: 0%</p>
          <div className="pip-progress-container"><div className="pip-progress-bar animated" style={{ width: '0%' }}></div></div>
        </div>
      </section>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────
export default function MobileForm() {
  const [step, setStep] = useState<Step>('loading');
  const [identifier, setIdentifier] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [activeTab, setActiveTab] = useState<ActiveTab>('DATA');
  const [flickerKey, setFlickerKey] = useState(0);

  // Boot sequence
  useEffect(() => {
    const timer = setTimeout(() => setStep('identifier'), 3500);
    return () => clearTimeout(timer);
  }, []);

  // Viewport background isolation for loading screen
  useEffect(() => {
    if (step === 'loading') {
      document.body.style.setProperty('background-color', '#000000', 'important');
      document.body.style.setProperty('background-image', 'none', 'important');
    } else {
      document.body.style.removeProperty('background-color');
      document.body.style.removeProperty('background-image');
    }
    return () => {
      document.body.style.removeProperty('background-color');
      document.body.style.removeProperty('background-image');
    };
  }, [step]);

  const handleTabClick = useCallback((tab: ActiveTab) => {
    if (tab === 'MAP') {
      window.open('https://maps.app.goo.gl/YQiJgGwhD6gBeQKL6', '_blank');
      return;
    }
    setActiveTab(tab);
    setFlickerKey(prev => prev + 1);
  }, []);

  const handleNextQuestion = (qId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [qId]: answer }));
    if (qId < questions.length) {
      setStep(`q${qId + 1}` as Step);
    } else {
      setStep('submitting');
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: sujetoData, error: sujetoError } = await supabase
        .from('sujetos')
        .insert([{ identificador: identifier }])
        .select('id')
        .single();

      if (sujetoError) throw sujetoError;

      const respuestasToInsert = Object.entries(answers).map(([qId, ans]) => ({
        sujeto_id: sujetoData.id,
        pregunta_id: parseInt(qId),
        respuesta: ans
      }));

      const { error: respuestasError } = await supabase
        .from('respuestas')
        .insert(respuestasToInsert);

      if (respuestasError) throw respuestasError;

      setTimeout(() => setStep('success'), 2000);
    } catch (error) {
      console.error("Error ZAX:", error);
      setStep(`q${questions.length}` as Step);
    }
  };

  // ─── BOOT OVERLAY (Loading Screen) ──────────────────
  if (step === 'loading') {
    return (
      <div className="pip-loader-overlay" style={{ backgroundColor: '#000000', zIndex: 9996 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/vault-boy-walking.gif"
          alt="Vault Boy Walking"
          className="vault-boy-img"
          style={{ width: '120px', height: '120px', objectFit: 'contain', marginBottom: '20px' }}
        />
        <div className="pip-typewriter pip-anim-fade-in" style={{ fontSize: '1.6em', marginBottom: '15px' }}>
          VAULT-TEC ZAX OS v6.7
        </div>
        <div className="pip-loader-text pip-anim-fade-in pip-delay-2">INICIALIZANDO TERMINAL ZAX...</div>
        <div className="pip-loader-text pip-anim-fade-in pip-delay-4">CONECTANDO A HARDWARE PIP-UI...</div>
        <div className="pip-loader-text pip-anim-fade-in pip-delay-6">SENSORES CALIBRADOS.</div>
      </div>
    );
  }

  // ─── MAIN TERMINAL SHELL ────────────────────────────
  const tabs: ActiveTab[] = ['STAT', 'INV', 'DATA', 'MAP', 'RADIO'];

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '8px' }}>
      <div className="pip-frame" style={{ width: '100%', maxWidth: '680px', minHeight: '85vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--pip-bg-dark)' }}>

        {/* ─── HEADER ──────────────────────────────────── */}
        <header style={{ padding: '12px 15px 0', flexShrink: 0 }}>
          <h1 className="pip-text highlight" style={{ fontSize: '1.2rem', marginBottom: '3px', textTransform: 'uppercase' }}>
            Vault-Tec ZAX Terminal
          </h1>
          <p className="pip-text subtle" style={{ fontSize: '0.8em' }}>
            PIP-CORE G.O.A.T. Module | [{activeTab}]
          </p>

          {/* Tab Bar */}
          <nav className="pip-tabs" style={{ marginTop: '10px' }}>
            {tabs.map(tab => (
              <button
                key={tab}
                className={`pip-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => handleTabClick(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
        </header>

        {/* ─── CONTENT AREA ────────────────────────────── */}
        <main
          key={flickerKey}
          className="pip-screen-flicker"
          style={{ flexGrow: 1, padding: '15px', overflowY: 'auto' }}
        >
          {/* Non-DATA tabs render simulated screens */}
          {activeTab === 'STAT' && <StatScreen />}
          {activeTab === 'INV' && <InvScreen />}
          {activeTab === 'RADIO' && <RadioScreen />}

          {/* DATA tab: the actual G.O.A.T. questionnaire */}
          {activeTab === 'DATA' && (
            <>
              {/* SUCCESS */}
              {step === 'success' && (
                <div className="pip-anim-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', textAlign: 'center' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/vault-boy-thumbs.gif"
                    alt="Vault Boy Thumbs Up"
                    className="vault-boy-img"
                    style={{ width: '140px', height: '140px', objectFit: 'contain', marginBottom: '20px' }}
                  />
                  <div className="pip-alert success" style={{ maxWidth: '400px', textAlign: 'center' }}>
                    <span className="pip-alert-title pip-ghosting" data-text="ASIGNACIÓN CONFIRMADA">ASIGNACIÓN CONFIRMADA</span>
                    <p>Bienvenido a casa, morador. Su perfil ha sido procesado por la inteligencia ZAX.</p>
                  </div>
                </div>
              )}

              {/* IDENTIFIER */}
              {step === 'identifier' && (
                <div className="pip-anim-fade-in">
                  <section className="pip-panel">
                    <div className="pip-panel-header">G.O.A.T. — Identificación de Sujeto</div>
                    <p className="pip-text" style={{ marginBottom: '15px' }}>
                      Por directiva del Supervisor, todo morador debe identificarse antes de iniciar la Evaluación General de Aptitud Ocupacional.
                    </p>
                    <label className="pip-text highlight" style={{ display: 'block', marginBottom: '8px' }}>Identificador de Sujeto:</label>
                    <input
                      type="text"
                      className="pip-input"
                      placeholder="Ej: MORADOR-101"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      style={{ textTransform: 'uppercase', marginBottom: '15px' }}
                    />
                    <button
                      className="pip-btn primary"
                      disabled={!identifier}
                      onClick={() => setStep('q1')}
                      style={{ width: '100%' }}
                    >
                      Iniciar Evaluación
                    </button>
                  </section>
                </div>
              )}

              {/* QUESTIONS */}
              {step.startsWith('q') && questions.map(q => {
                if (step !== `q${q.id}`) return null;
                return (
                  <div key={q.id} className="pip-anim-fade-in">
                    <section className="pip-panel">
                      <div className="pip-panel-header">Pregunta {q.id} de {questions.length}</div>
                      <h3 className="text-[#1cfc03] drop-shadow-[0_0_8px_rgba(28,252,3,0.8)] text-xl md:text-2xl mb-6 leading-relaxed uppercase">
                        {q.text}
                      </h3>
                      {q.options.map((opt) => (
                        <label key={opt.text} className="pip-radio-container">
                          <span className="text-[#1cfc03] text-lg">{opt.text}</span>
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            value={opt.text}
                            onChange={() => handleNextQuestion(q.id, opt.text)}
                          />
                          <span className="checkmark"></span>
                        </label>
                      ))}
                    </section>
                  </div>
                );
              })}

              {/* SUBMITTING */}
              {step === 'submitting' && (
                <div className="pip-anim-fade-in">
                  <section className="pip-panel" style={{ textAlign: 'center' }}>
                    <div className="pip-panel-header">Procesando Perfil Psicológico</div>
                    <div style={{ padding: '20px 0' }}>
                      <div className="pip-loader" style={{ justifyContent: 'center', marginBottom: '20px' }}>TRANSMITIENDO DATOS</div>
                      <div className="pip-progress-container" style={{ height: '16px' }}>
                        <div className="pip-progress-bar animated" style={{ width: '100%' }}></div>
                      </div>
                      <button
                        className="pip-btn primary"
                        onClick={handleSubmit}
                        style={{ width: '100%', marginTop: '25px', fontSize: '1.1em' }}
                      >
                        [ ENVIAR DATOS ]
                      </button>
                    </div>
                  </section>
                </div>
              )}
            </>
          )}
        </main>

        {/* ─── FOOTER (Always Visible) ─────────────────── */}
        <footer style={{
          flexShrink: 0,
          borderTop: '2px solid var(--pip-green-dim)',
          padding: '8px 15px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.8em',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: 'var(--pip-green-bright)',
        }}>
          <span>HP 100/100</span>
          <span>LEVEL 1</span>
          <span>AP 85/85</span>
        </footer>

      </div>
    </div>
  );
}
