import React, { useState, useEffect, useMemo } from 'react';
import { 
  CATEGORY_DEFINITIONS, 
  GEMINI_MODELS, 
  generateStudentEvaluation 
} from './services/geminiService';

export default function App() {
  // --- Persistent Settings (Default to Dark Mode & Gemini 3.8 Flash) ---
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('evalcraft_gemini_key') || '');
  const [selectedModel, setSelectedModel] = useState(() => {
    const saved = localStorage.getItem('evalcraft_gemini_model');
    if (!saved || saved === 'gemini-2.0-flash' || saved === 'gemini-1.5-flash') {
      return 'gemini-3.8-flash';
    }
    return saved;
  });
  const [theme, setTheme] = useState(() => localStorage.getItem('evalcraft_theme') || 'dark');
  const [savedEvaluations, setSavedEvaluations] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('evalcraft_history')) || [];
    } catch {
      return [];
    }
  });

  // --- Student Form State (First name only, Music default) ---
  const [studentName, setStudentName] = useState('');
  const [subject, setSubject] = useState('Music');
  
  // Grade as float value from 1.0 (best) to 5.0 (worst)
  const [grade, setGrade] = useState(1.5);
  const [wordLimit, setWordLimit] = useState(120);

  // 5 Categories State: { [catId]: { score: 1-5, chips: string[] } }
  const [categories, setCategories] = useState(() => {
    const initial = {};
    CATEGORY_DEFINITIONS.forEach(cat => {
      initial[cat.id] = { score: 3, chips: [] };
    });
    return initial;
  });

  // Keywords State (Empty by default)
  const [strengths, setStrengths] = useState([]);
  const [weaknesses, setWeaknesses] = useState([]);
  const [goals, setGoals] = useState([]);

  // Keyword Text Input buffer
  const [strengthInput, setStrengthInput] = useState('');
  const [weaknessInput, setWeaknessInput] = useState('');
  const [goalInput, setGoalInput] = useState('');

  // Generation & Output State
  const [generatedText, setGeneratedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState('');

  // Apply Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('evalcraft_theme', theme);
  }, [theme]);

  // Persist History
  useEffect(() => {
    localStorage.setItem('evalcraft_history', JSON.stringify(savedEvaluations));
  }, [savedEvaluations]);

  // Save Settings
  const handleSaveSettings = (newKey, newModel) => {
    setApiKey(newKey);
    setSelectedModel(newModel);
    localStorage.setItem('evalcraft_gemini_key', newKey);
    localStorage.setItem('evalcraft_gemini_model', newModel);
    setShowSettings(false);
    showToast('Settings saved successfully!');
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // --- Category Handlers ---
  const handleCategoryScoreChange = (catId, newScore) => {
    setCategories(prev => ({
      ...prev,
      [catId]: {
        ...prev[catId],
        score: newScore
      }
    }));
  };

  const handleToggleChip = (catId, chipText) => {
    setCategories(prev => {
      const currentChips = prev[catId]?.chips || [];
      const exists = currentChips.includes(chipText);
      const updatedChips = exists 
        ? currentChips.filter(c => c !== chipText)
        : [...currentChips, chipText];

      return {
        ...prev,
        [catId]: {
          ...prev[catId],
          chips: updatedChips
        }
      };
    });
  };

  // --- Keyword Tag Handlers ---
  const handleAddKeyword = (value, setter, inputSetter) => {
    const trimmed = value.trim().replace(/^,+|,+$/g, '');
    if (!trimmed) return;
    setter(prev => [...new Set([...prev, trimmed])]);
    inputSetter('');
  };

  const handleRemoveKeyword = (setter, itemToRemove) => {
    setter(prev => prev.filter(item => item !== itemToRemove));
  };

  // --- Word & Char Counting ---
  const wordCount = useMemo(() => {
    if (!generatedText.trim()) return 0;
    return generatedText.trim().split(/\s+/).length;
  }, [generatedText]);

  const charCount = generatedText.length;

  // --- Generation Logic ---
  const handleGenerate = async (refinementInstruction = null) => {
    setIsGenerating(true);

    const parsedGrade = parseFloat(grade) || 1.0;

    const firstNameOnly = studentName.trim().split(/\s+/)[0] || 'The student';

    const params = {
      apiKey,
      model: selectedModel,
      studentName: firstNameOnly,
      subject: 'Music',
      grade: parsedGrade.toFixed(1),
      wordLimit,
      tone: 'Warm, balanced, and constructive',
      perspective: 'To Parents (3rd person, first name only, age 6-12)',
      categories,
      strengths,
      weaknesses,
      goals,
      refinementInstruction,
      previousEvaluation: generatedText
    };

    try {
      const result = await generateStudentEvaluation(params);
      setGeneratedText(result);
      showToast(refinementInstruction ? 'Evaluation updated!' : 'Evaluation generated!');
    } catch (err) {
      console.error(err);
      if (err.message && err.message.includes('prepayment credits are depleted')) {
        alert(
          `Google AI Studio Billing Notice:\n\n` +
          `Your API key belongs to a Google Cloud project with depleted prepay credits.\n\n` +
          `Quick Fix (100% Free Tier):\n` +
          `1. Go to Google AI Studio (aistudio.google.com/app/apikey)\n` +
          `2. Click 'Create API key' -> 'Create in NEW project' (do not link billing)\n` +
          `3. Paste the new key in Settings here to use the Free Tier.`
        );
      } else {
        alert(`Generation failed: ${err.message}\n\nPlease check your Gemini API key in Settings.`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy to clipboard
  const handleCopy = () => {
    if (!generatedText) return;
    navigator.clipboard.writeText(generatedText);
    showToast('Copied evaluation to clipboard!');
  };

  // Save to History
  const handleSaveToHistory = () => {
    if (!generatedText) return;
    const parsedGrade = parseFloat(grade) || 1.0;
    const firstNameOnly = studentName.trim().split(/\s+/)[0] || 'Student';
    const newEntry = {
      id: Date.now(),
      studentName: firstNameOnly,
      subject: 'Music',
      grade: parsedGrade.toFixed(1),
      text: generatedText,
      wordCount,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    setSavedEvaluations(prev => [newEntry, ...prev.slice(0, 49)]);
    showToast('Saved to evaluated students list!');
  };

  // Clear for next student
  const handleNextStudent = () => {
    if (generatedText && !savedEvaluations.some(e => e.text === generatedText)) {
      handleSaveToHistory();
    }
    setStudentName('');
    setStrengths([]);
    setWeaknesses([]);
    setGoals([]);
    setGeneratedText('');
    showToast('Ready for next student!');
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo-area">
            <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
              Mamut's student evaluator
            </span>
          </div>

          <div className="header-actions">
            <button 
              id="theme-toggle-btn"
              className="btn btn-ghost btn-sm"
              onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
              title="Toggle Light/Dark Theme"
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
            <button 
              id="settings-modal-btn"
              className="btn btn-outline btn-sm" 
              onClick={() => setShowSettings(true)}
            >
              ⚙️ {apiKey ? 'Settings' : 'Set Gemini API Key'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="main-layout">
        {/* Left Column: Teacher Input Controls */}
        <div className="panel input-column">
          <div className="panel-header">
            <h2 className="panel-title">
              <span>Student profile</span>
            </h2>
          </div>

          {/* Banner if no API key is entered */}
          {!apiKey && (
            <div className="api-key-banner">
              <div>
                <strong>Demo Mode Active:</strong> You can test all inputs and sample generation immediately! To unlock full Gemini 3.8 Flash generations, add your free API key in Settings.
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowSettings(true)}>
                Add Key (Free)
              </button>
            </div>
          )}

          {/* Basic Student Information */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="student-name-input">
                Name
                <span className="hint">First name only</span>
              </label>
              <input
                id="student-name-input"
                type="text"
                className="form-input"
                placeholder="First name only (e.g. Emma)"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="subject-select">
                Subject
              </label>
              <select
                id="subject-select"
                className="form-select"
                value={subject}
                onChange={e => setSubject(e.target.value)}
              >
                <option value="Music">Music</option>
                <option value="English Literature" disabled>English / Language Arts (Locked)</option>
                <option value="Mathematics" disabled>Mathematics (Locked)</option>
                <option value="Science" disabled>Science (Locked)</option>
                <option value="Social Studies" disabled>Social Studies (Locked)</option>
                <option value="Art & Design" disabled>Art & Design (Locked)</option>
                <option value="Physical Education" disabled>Physical Education (Locked)</option>
                <option value="General Homeroom" disabled>General Homeroom (Locked)</option>
                <option value="Other" disabled>Other (Locked)</option>
              </select>
            </div>
          </div>

          {/* Grade (Float 1.0 - 5.0) & Word Limit */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="grade-input">
                Grade
                <span className="hint">1.0 (best) – 5.0 (worst)</span>
              </label>
              <input
                id="grade-input"
                type="number"
                step="0.1"
                min="1.0"
                max="5.0"
                className="form-input"
                placeholder="e.g. 1.0 or 2.3"
                value={grade}
                onChange={e => setGrade(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Word limit
                <span className="hint">{wordLimit} words</span>
              </label>
              <div className="slider-container">
                <input
                  id="word-limit-slider"
                  type="range"
                  min="50"
                  max="250"
                  step="10"
                  className="range-slider"
                  value={wordLimit}
                  onChange={e => setWordLimit(Number(e.target.value))}
                />
                <span className="slider-val-badge">{wordLimit} w</span>
              </div>
            </div>
          </div>

          {/* 5 Categories (Titles updated: Academics, Work ethics, Participation, Social, Growth) */}
          <div style={{ marginTop: '16px', marginBottom: '14px' }}>
            {CATEGORY_DEFINITIONS.map(cat => {
              const current = categories[cat.id] || { score: 3, chips: [] };
              const currentLevel = cat.levels.find(l => l.score === current.score) || cat.levels[2];

              return (
                <div key={cat.id} className="category-card" id={`cat-card-${cat.id}`}>
                  <div className="category-card-top">
                    <div className="category-name-wrap">
                      <span className="category-icon">{cat.icon}</span>
                      <span className="category-title">{cat.name}</span>
                    </div>
                    <span className={`category-level-badge level-${current.score}`}>
                      Level {current.score}/5: {currentLevel.label}
                    </span>
                  </div>

                  {/* 5-Step Segmented Bar */}
                  <div className="level-selector-bar">
                    {cat.levels.map(lvl => (
                      <button
                        key={lvl.score}
                        type="button"
                        id={`btn-${cat.id}-score-${lvl.score}`}
                        className={`level-button ${current.score === lvl.score ? 'active' : ''}`}
                        onClick={() => handleCategoryScoreChange(cat.id, lvl.score)}
                        title={`${lvl.label}: ${lvl.desc}`}
                      >
                        <span className="score-num">{lvl.score}</span>
                        <span className="score-label">{lvl.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Preset observation chips */}
                  <div className="chips-container">
                    {cat.presetChips.map(chip => {
                      const isActive = current.chips.includes(chip);
                      return (
                        <button
                          key={chip}
                          type="button"
                          className={`chip ${isActive ? 'active' : ''}`}
                          onClick={() => handleToggleChip(cat.id, chip)}
                        >
                          {chip}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Keywords (Strengths, Challenges, Next steps) */}
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '14px' }}>
              Custom keywords
            </h3>

            {/* Strengths */}
            <div className="form-group">
              <label className="form-label">
                <span>Strengths</span>
                <span className="hint">Press Enter or comma to add</span>
              </label>
              <div className="tag-input-box">
                {strengths.map(tag => (
                  <span key={tag} className="tag-pill">
                    {tag}
                    <button type="button" className="tag-remove-btn" onClick={() => handleRemoveKeyword(setStrengths, tag)}>×</button>
                  </span>
                ))}
                <input
                  id="strengths-keyword-input"
                  type="text"
                  className="tag-input-field"
                  placeholder="Type a strength (e.g. good rhythm sense)..."
                  value={strengthInput}
                  onChange={e => setStrengthInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      handleAddKeyword(strengthInput, setStrengths, setStrengthInput);
                    }
                  }}
                />
              </div>
            </div>

            {/* Challenges */}
            <div className="form-group">
              <label className="form-label">
                <span>Challenges</span>
                <span className="hint">Constructive focus areas</span>
              </label>
              <div className="tag-input-box">
                {weaknesses.map(tag => (
                  <span key={tag} className="tag-pill" style={{ background: 'var(--warning-light)', borderColor: 'var(--warning-border)', color: 'var(--warning)' }}>
                    {tag}
                    <button type="button" className="tag-remove-btn" style={{ color: 'var(--warning)' }} onClick={() => handleRemoveKeyword(setWeaknesses, tag)}>×</button>
                  </span>
                ))}
                <input
                  id="weaknesses-keyword-input"
                  type="text"
                  className="tag-input-field"
                  placeholder="Type a challenge (e.g. note reading)..."
                  value={weaknessInput}
                  onChange={e => setWeaknessInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      handleAddKeyword(weaknessInput, setWeaknesses, setWeaknessInput);
                    }
                  }}
                />
              </div>
            </div>

            {/* Next steps */}
            <div className="form-group">
              <label className="form-label">
                <span>Next steps</span>
                <span className="hint">Recommendation for next term</span>
              </label>
              <div className="tag-input-box">
                {goals.map(tag => (
                  <span key={tag} className="tag-pill" style={{ background: 'var(--success-light)', borderColor: 'var(--success-border)', color: 'var(--success)' }}>
                    {tag}
                    <button type="button" className="tag-remove-btn" style={{ color: 'var(--success)' }} onClick={() => handleRemoveKeyword(setGoals, tag)}>×</button>
                  </span>
                ))}
                <input
                  id="goals-keyword-input"
                  type="text"
                  className="tag-input-field"
                  placeholder="Type a next step (e.g. practice singing at home)..."
                  value={goalInput}
                  onChange={e => setGoalInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      handleAddKeyword(goalInput, setGoals, setGoalInput);
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              id="next-student-btn"
              type="button"
              className="btn btn-outline"
              onClick={handleNextStudent}
              title="Clears current student name and keywords to start next student"
            >
              Next Student ➡️
            </button>
          </div>
        </div>

        {/* Right Column: Generated Evaluation Output & History */}
        <div className="output-column">
          <div className="panel output-card">
            <div className="panel-header" style={{ marginBottom: '12px' }}>
              <h2 className="panel-title">
                <span>Generated Evaluation</span>
                {studentName && <span className="badge">for {studentName.trim().split(/\s+/)[0]}</span>}
              </h2>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  id="generate-eval-btn"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleGenerate()}
                  disabled={isGenerating}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, padding: '8px 14px' }}
                >
                  {isGenerating ? 'Generating...' : '✨ Generate'}
                </button>
                <button
                  id="save-eval-btn"
                  className="btn btn-outline btn-sm"
                  onClick={handleSaveToHistory}
                  disabled={!generatedText}
                >
                  💾 Save
                </button>
                <button
                  id="copy-eval-btn"
                  className="btn btn-outline btn-sm"
                  onClick={handleCopy}
                  disabled={!generatedText}
                >
                  📋 Copy
                </button>
              </div>
            </div>

            {/* Editable Output Textarea */}
            <textarea
              id="generated-evaluation-textarea"
              className="output-textarea"
              placeholder="Your personalized evaluation will appear here. You can freely edit and refine the text directly in this box before copying."
              value={generatedText}
              onChange={e => setGeneratedText(e.target.value)}
            />

            {/* Meta Stats Bar */}
            <div className="output-meta-bar">
              <div className="stats-group">
                <span className="stat-item">
                  Words: <span className="stat-val">{wordCount}</span> / {wordLimit} target
                </span>
                <span className="stat-item">
                  Characters: <span className="stat-val">{charCount}</span>
                </span>
              </div>
              <div>
                {generatedText && (
                  <span style={{ color: 'var(--success)', fontWeight: '600' }}>
                    ✓ Ready to copy
                  </span>
                )}
              </div>
            </div>

            {/* Quick Refinement Action Chips */}
            {generatedText && (
              <div className="refinement-bar">
                <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', alignSelf: 'center', marginRight: '4px' }}>
                  Quick Polish:
                </span>
                <button
                  id="refine-shorter-btn"
                  className="refine-btn"
                  disabled={isGenerating}
                  onClick={() => handleGenerate('Make the evaluation approximately 25% shorter while keeping the core message intact.')}
                >
                  🤏 Make Shorter
                </button>
                <button
                  id="refine-encouraging-btn"
                  className="refine-btn"
                  disabled={isGenerating}
                  onClick={() => handleGenerate('Make the tone more enthusiastic, warm, and uplifting for the student.')}
                >
                  🌟 More Encouraging
                </button>
                <button
                  id="refine-actionable-btn"
                  className="refine-btn"
                  disabled={isGenerating}
                  onClick={() => handleGenerate('Sharpen the next-step recommendations to be even more concrete and actionable for next semester.')}
                >
                  🎯 Sharpen Next Steps
                </button>
                <button
                  id="refine-regenerate-btn"
                  className="refine-btn"
                  disabled={isGenerating}
                  onClick={() => handleGenerate()}
                >
                  🔄 Fresh Rephrase
                </button>
              </div>
            )}
          </div>

          {/* History of Evaluated Students Tray */}
          <div className="panel history-section" style={{ marginTop: '20px' }}>
            <div className="panel-header" style={{ marginBottom: '14px', borderBottom: 'none', paddingBottom: 0 }}>
              <h3 className="panel-title" style={{ fontSize: '16px' }}>
                <span>Evaluated Students Queue</span>
                <span className="badge">{savedEvaluations.length} saved</span>
              </h3>
              {savedEvaluations.length > 0 && (
                <button 
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    if (confirm('Clear all saved evaluation history?')) {
                      setSavedEvaluations([]);
                    }
                  }}
                >
                  Clear History
                </button>
              )}
            </div>

            {savedEvaluations.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-dim)', textAlign: 'center', padding: '24px 0' }}>
                Evaluations you generate or save will be queued here so you never lose track of a student.
              </p>
            ) : (
              <div style={{ maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
                {savedEvaluations.map(entry => (
                  <div key={entry.id} className="history-item">
                    <div className="history-info">
                      <span className="history-name">{entry.studentName}</span>
                      <span className="history-meta">{entry.subject} • Grade {entry.grade} • {entry.wordCount} words • {entry.timestamp}</span>
                    </div>
                    <div className="history-actions">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          setGeneratedText(entry.text);
                          setStudentName(entry.studentName);
                          showToast(`Loaded evaluation for ${entry.studentName}`);
                        }}
                        title="Load into editor"
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          navigator.clipboard.writeText(entry.text);
                          showToast(`Copied ${entry.studentName}'s evaluation!`);
                        }}
                        title="Copy to clipboard"
                      >
                        Copy
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--danger)', padding: '4px 8px' }}
                        onClick={() => setSavedEvaluations(prev => prev.filter(e => e.id !== entry.id))}
                        title="Remove from history"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-main)' }}>
                Gemini AI Settings
              </h3>
              <button 
                className="btn btn-ghost btn-sm" 
                style={{ fontSize: '18px', padding: '4px 8px' }}
                onClick={() => setShowSettings(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label" htmlFor="gemini-key-input">
                  Google Gemini API Key
                  <span className="hint">Saved in browser localStorage</span>
                </label>
                <input
                  id="gemini-key-input"
                  type="password"
                  className="form-input"
                  placeholder="AIzaSy..."
                  defaultValue={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                />
                <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Need a key? Get one 100% free with generous rate limits at{' '}
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noreferrer" 
                    style={{ color: 'var(--primary)', fontWeight: '600' }}
                  >
                    Google AI Studio
                  </a>.
                </p>
              </div>

              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label" htmlFor="model-select">
                  Gemini Model
                  <span className="hint">Up-to-date models</span>
                </label>
                <select
                  id="model-select"
                  className="form-select"
                  value={GEMINI_MODELS.some(m => m.id === selectedModel) ? selectedModel : 'custom'}
                  onChange={e => {
                    if (e.target.value !== 'custom') {
                      setSelectedModel(e.target.value);
                    }
                  }}
                >
                  {GEMINI_MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                  <option value="custom">Custom / Other Model ID...</option>
                </select>

                <div style={{ marginTop: '8px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '4px', display: 'block' }}>
                    Active Model ID:
                  </label>
                  <input
                    id="custom-model-input"
                    type="text"
                    className="form-input"
                    placeholder="e.g. gemini-3.8-flash"
                    value={selectedModel}
                    onChange={e => setSelectedModel(e.target.value.trim())}
                    style={{ fontSize: '13px', fontFamily: 'monospace' }}
                  />
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '6px' }}>
                  <strong>Gemini 3.8 Flash</strong> is recommended: Google's flagship high-intelligence model providing state-of-the-art reasoning, rapid generation, and nuanced evaluations.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowSettings(false)}>
                Cancel
              </button>
              <button 
                id="save-settings-btn"
                className="btn btn-primary" 
                onClick={() => handleSaveSettings(apiKey, selectedModel)}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="toast">
          <span>✨</span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
