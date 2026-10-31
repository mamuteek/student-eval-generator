import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  CATEGORY_DEFINITIONS, 
  LLM_PROVIDERS,
  GEMINI_MODELS, 
  generateStudentEvaluation 
} from './services/geminiService';

export default function App() {
  const abortControllerRef = useRef(null);
  const retryTimerRef = useRef(null);
  const userCancelledRef = useRef(false);

  // --- Persistent Settings (Multi-Provider Support) ---
  const [selectedProvider, setSelectedProvider] = useState(() => {
    const saved = localStorage.getItem('evalcraft_provider');
    if (saved === 'mistral' || saved === 'cerebras' || saved === 'grok') return 'gemini';
    return saved || 'gemini';
  });
  
  const [apiKeys, setApiKeys] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('evalcraft_api_keys'));
      if (saved && typeof saved === 'object') {
        const { mistral, cerebras, grok, ...rest } = saved;
        return { gemini: '', groq: '', openrouter: '', ...rest };
      }
    } catch {}
    const oldKey = localStorage.getItem('evalcraft_gemini_key') || '';
    return { gemini: oldKey, groq: '', openrouter: '' };
  });

  const [selectedModel, setSelectedModel] = useState(() => {
    const saved = localStorage.getItem('evalcraft_gemini_model');
    if (!saved || saved === 'gemini-2.0-flash' || saved === 'gemini-1.5-flash' || saved === 'mistral-small-latest' || saved === 'llama3.1-8b' || saved === 'llama-3.3-70b' || saved?.startsWith('grok-')) {
      return 'gemini-3.8-flash';
    }
    if (saved === 'llama-3.3-70b-versatile') {
      return 'llama-3.1-8b-instant';
    }
    if (saved?.includes('llama-3.3-70b-instruct')) {
      return 'openrouter/free';
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

  // Current active key for selected provider
  const activeApiKey = apiKeys[selectedProvider] || '';
  const currentProviderObj = LLM_PROVIDERS.find(p => p.id === selectedProvider) || LLM_PROVIDERS[0];

  // --- Student Form State (First name only, Gender for pronouns) ---
  const [studentName, setStudentName] = useState('');
  const [gender, setGender] = useState('Female');
  
  // Grade scale: S/U for younger students, A-F (without E) for older students
  const [grade, setGrade] = useState('S');
  const [charLimit, setCharLimit] = useState(() => {
    const saved = localStorage.getItem('evalcraft_char_limit');
    return saved ? Number(saved) : 800;
  });

  useEffect(() => {
    localStorage.setItem('evalcraft_char_limit', charLimit);
  }, [charLimit]);

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
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [attemptStatusText, setAttemptStatusText] = useState('');

  // Auto-retry settings (Defaults to true, up to 8 attempts)
  const [autoRetry, setAutoRetry] = useState(() => {
    const saved = localStorage.getItem('evalcraft_auto_retry');
    return saved !== null ? saved === 'true' : true;
  });
  const [maxRetries, setMaxRetries] = useState(() => {
    const saved = localStorage.getItem('evalcraft_max_retries');
    return saved ? Number(saved) : 8;
  });

  // UI state & Modal editing state
  const [showSettings, setShowSettings] = useState(false);
  const [modalProvider, setModalProvider] = useState('gemini');
  const [modalKey, setModalKey] = useState('');
  const [modalModel, setModalModel] = useState('gemini-3.8-flash');
  const [modalAutoRetry, setModalAutoRetry] = useState(true);
  const [modalMaxRetries, setModalMaxRetries] = useState(8);
  const [toast, setToast] = useState('');

  // Sync modal state when settings modal opens
  useEffect(() => {
    if (showSettings) {
      const validProvs = ['gemini', 'groq', 'openrouter'];
      const prov = validProvs.includes(selectedProvider) ? selectedProvider : 'gemini';
      setModalProvider(prov);
      setModalKey(apiKeys[prov] || '');
      setModalAutoRetry(autoRetry);
      setModalMaxRetries(maxRetries);
      const provObj = LLM_PROVIDERS.find(p => p.id === prov);
      const isKnownModel = provObj?.models.some(m => m.id === selectedModel);
      if (!isKnownModel && provObj && provObj.models.length > 0) {
        setModalModel(provObj.models[0].id);
      } else {
        setModalModel(selectedModel);
      }
    }
  }, [showSettings, selectedProvider, selectedModel, apiKeys, autoRetry, maxRetries]);

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
  const handleSaveSettings = (provId, newKey, newModel, autoRetryVal = modalAutoRetry, maxRetriesVal = modalMaxRetries) => {
    setSelectedProvider(provId);
    setSelectedModel(newModel);
    setAutoRetry(autoRetryVal);
    setMaxRetries(maxRetriesVal);

    const updatedKeys = {
      ...apiKeys,
      [provId]: newKey
    };
    setApiKeys(updatedKeys);

    localStorage.setItem('evalcraft_provider', provId);
    localStorage.setItem('evalcraft_api_keys', JSON.stringify(updatedKeys));
    localStorage.setItem('evalcraft_gemini_model', newModel);
    localStorage.setItem('evalcraft_auto_retry', String(autoRetryVal));
    localStorage.setItem('evalcraft_max_retries', String(maxRetriesVal));
    if (provId === 'gemini') {
      localStorage.setItem('evalcraft_gemini_key', newKey);
    }

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

  const handleCancelGeneration = () => {
    userCancelledRef.current = true;
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
    setCurrentAttempt(0);
    setAttemptStatusText('');
    showToast('Generation cancelled.');
  };

  // --- Generation Logic with Automated Retry Loop ---
  const handleGenerate = async (refinementInstruction = null) => {
    // If generation is already underway, clicking toggles cancel/stop!
    if (isGenerating) {
      handleCancelGeneration();
      return;
    }

    userCancelledRef.current = false;
    setIsGenerating(true);
    setAttemptStatusText('Contacting AI service...');

    const firstNameOnly = studentName.trim().split(/\s+/)[0] || 'The student';

    const params = {
      provider: selectedProvider,
      apiKey: activeApiKey,
      model: selectedModel,
      studentName: firstNameOnly,
      gender,
      subject: 'Music',
      grade: grade || 'S',
      charLimit,
      tone: 'Warm, balanced, and constructive',
      perspective: 'To Parents (3rd person, first name only, age 6-12)',
      categories,
      strengths,
      weaknesses,
      goals,
      refinementInstruction,
      previousEvaluation: generatedText
    };

    // Demo Mode: generate locally without API key
    if (!activeApiKey || activeApiKey.trim() === '') {
      try {
        const result = await generateStudentEvaluation(params);
        setGeneratedText(result);
        showToast(refinementInstruction ? 'Evaluation updated!' : 'Evaluation generated!');
      } catch (err) {
        alert(`Generation failed: ${err.message}`);
      } finally {
        setIsGenerating(false);
        setCurrentAttempt(0);
        setAttemptStatusText('');
      }
      return;
    }

    const maxAttempts = autoRetry ? Math.max(1, maxRetries) : 1;
    let attempt = 1;

    while (attempt <= maxAttempts && !userCancelledRef.current) {
      setCurrentAttempt(attempt);
      setAttemptStatusText(attempt === 1 ? 'Generating evaluation narrative...' : `Retrying (Attempt ${attempt} of ${maxAttempts})...`);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      // 25 second timeout per attempt for responsive auto-retry
      let isTimeout = false;
      const timeoutId = setTimeout(() => {
        if (abortControllerRef.current === controller) {
          isTimeout = true;
          controller.abort();
        }
      }, 25000);

      try {
        const result = await generateStudentEvaluation(params, controller.signal);
        clearTimeout(timeoutId);

        if (userCancelledRef.current) {
          return;
        }

        if (!result || !result.trim()) {
          throw new Error('Received empty response from AI.');
        }

        setGeneratedText(result);
        showToast(refinementInstruction ? 'Evaluation updated!' : 'Evaluation generated!');
        setIsGenerating(false);
        setCurrentAttempt(0);
        setAttemptStatusText('');
        return; // Success!
      } catch (err) {
        clearTimeout(timeoutId);

        // If user manually clicked cancel, exit immediately
        if (userCancelledRef.current || (err.name === 'AbortError' && !isTimeout)) {
          handleCancelGeneration();
          return;
        }

        console.warn(`Attempt ${attempt} error:`, err);

        // Check for non-retryable errors
        const isDepleted = err.message && err.message.includes('prepayment credits are depleted');
        const isAuthError = err.message && (
          err.message.includes('API_KEY_INVALID') ||
          err.message.includes('API key not valid') ||
          err.message.includes('status 401') ||
          err.message.includes('Unauthorized') ||
          err.message.includes('invalid api key')
        );

        if (isDepleted) {
          alert(
            `Google AI Studio Billing Notice:\n\n` +
            `Your Gemini API key belongs to a Google Cloud project with depleted prepay credits.\n\n` +
            `Quick Options:\n` +
            `1. In Google AI Studio (aistudio.google.com/app/apikey), click 'Create in NEW project' for a 100% free tier key.\n` +
            `2. Or switch to Groq (console.groq.com) or OpenRouter (openrouter.ai) in Settings for instant free generation!`
          );
          break;
        }

        if (isAuthError) {
          alert(`Authentication Error: ${err.message}\n\nPlease check your ${currentProviderObj.name} API key in Settings.`);
          break;
        }

        // Retryable error: check if we have remaining attempts
        if (attempt < maxAttempts && !userCancelledRef.current) {
          const failureReason = isTimeout ? 'Timed out (25s)' : (err.message?.replace(/^Error:\s*/, '') || 'Temporary network/server glitch');
          setAttemptStatusText(`Attempt ${attempt} had an issue (${failureReason.slice(0, 32)}). Retrying in 2s (Attempt ${attempt + 1}/${maxAttempts})...`);
          showToast(`Attempt ${attempt} issue: ${failureReason.slice(0, 32)}. Auto-retrying (${attempt + 1}/${maxAttempts})...`);

          attempt++;
          // Wait 2 seconds before next attempt (cancellable)
          await new Promise(resolve => {
            retryTimerRef.current = setTimeout(resolve, 2000);
          });
          retryTimerRef.current = null;

          if (userCancelledRef.current) {
            return;
          }
        } else {
          // Reached max attempts
          const lastErr = isTimeout ? 'Request timed out after 25s' : (err.message || 'Unknown error');
          alert(
            `Generation did not succeed after ${maxAttempts} attempt${maxAttempts > 1 ? 's' : ''}.\n\n` +
            `Last error: ${lastErr}\n\n` +
            `Tip: Free-tier servers may be temporarily congested. You can switch to another free provider in Settings (e.g. Groq or Gemini 3.8 Flash) or try again.`
          );
          break;
        }
      }
    }

    setIsGenerating(false);
    setCurrentAttempt(0);
    setAttemptStatusText('');
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
    const firstNameOnly = studentName.trim().split(/\s+/)[0] || 'Student';
    const newEntry = {
      id: Date.now(),
      studentName: firstNameOnly,
      gender,
      subject: 'Music',
      grade: grade || 'S',
      text: generatedText,
      wordCount,
      charCount,
      charLimit,
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
              ⚙️ {activeApiKey ? `Settings (${currentProviderObj.name.split(' ')[0]})` : 'Set API Key (Free)'}
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
          {!activeApiKey && (
            <div className="api-key-banner">
              <div>
                <strong>Demo Mode Active:</strong> You can test all inputs and sample generation immediately! To unlock full AI generations, add a free API key in Settings (supports Gemini 3.8, Groq LPU, and OpenRouter).
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
              <label className="form-label" htmlFor="gender-select">
                Gender
                <span className="hint">For pronouns</span>
              </label>
              <select
                id="gender-select"
                className="form-select"
                value={gender}
                onChange={e => setGender(e.target.value)}
              >
                <option value="Female">Female (she / her / hers)</option>
                <option value="Male">Male (he / him / his)</option>
              </select>
            </div>
          </div>

          {/* Grade Dropdown (S/U or A–F) & Character Limit */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="grade-select">
                Grade
                <span className="hint">S/U or A–F</span>
              </label>
              <select
                id="grade-select"
                className="form-select"
                value={grade}
                onChange={e => setGrade(e.target.value)}
              >
                <optgroup label="Younger Students (2-Level Scale)">
                  <option value="S">S – Satisfactory</option>
                  <option value="U">U – Unsatisfactory</option>
                </optgroup>
                <optgroup label="Older Students (American A–F Scale)">
                  <option value="A">A – Outstanding / Excellent</option>
                  <option value="B">B – Good / Above Average</option>
                  <option value="C">C – Average / Satisfactory</option>
                  <option value="D">D – Below Average / Developing</option>
                  <option value="F">F – Unsatisfactory / Failing</option>
                </optgroup>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="char-limit-slider">
                Character limit
                <span className="hint">{charLimit} characters</span>
              </label>
              <div className="slider-container">
                <input
                  id="char-limit-slider"
                  type="range"
                  min="200"
                  max="2500"
                  step="25"
                  className="range-slider"
                  value={charLimit}
                  onChange={e => setCharLimit(Number(e.target.value))}
                />
                <span className="slider-val-badge">{charLimit} c</span>
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
                  type="button"
                  className={`btn btn-sm ${isGenerating ? 'btn-cancel' : 'btn-primary'}`}
                  onClick={() => handleGenerate()}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, padding: '8px 14px' }}
                  title={isGenerating ? 'Click to cancel auto-retry generation' : 'Generate verbal evaluation'}
                >
                  {isGenerating 
                    ? `⏹️ Cancel ${currentAttempt > 1 ? `(Try ${currentAttempt})` : ''}` 
                    : '✨ Generate'
                  }
                </button>
                <button
                  id="save-eval-btn"
                  className="btn btn-outline btn-sm"
                  onClick={handleSaveToHistory}
                  disabled={!generatedText || isGenerating}
                >
                  💾 Save
                </button>
                <button
                  id="copy-eval-btn"
                  className="btn btn-outline btn-sm"
                  onClick={handleCopy}
                  disabled={!generatedText || isGenerating}
                >
                  📋 Copy
                </button>
                {generatedText && (
                  <button
                    id="reset-eval-btn"
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      if (confirm('Clear current generated text?')) {
                        setGeneratedText('');
                      }
                    }}
                    disabled={isGenerating}
                    title="Clear current text"
                    style={{ fontSize: '12px', color: 'var(--text-dim)' }}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Real-time Generation & Auto-retry Status Banner */}
            {isGenerating && (
              <div className="generating-indicator" id="generating-indicator">
                <span className="spinner-dot" />
                <span style={{ flex: 1 }}>{attemptStatusText || 'Generating evaluation narrative...'}</span>
                {currentAttempt > 1 && (
                  <span className="retry-pill">
                    Attempt {currentAttempt} of {autoRetry ? maxRetries : 1}
                  </span>
                )}
              </div>
            )}

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
                  Characters: <span className="stat-val" style={{ color: charCount > charLimit ? 'var(--danger)' : undefined }}>{charCount}</span> / {charLimit} max
                </span>
                <span className="stat-item">
                  Words: <span className="stat-val">{wordCount}</span>
                </span>
              </div>
              <div>
                {charCount > charLimit ? (
                  <span style={{ color: 'var(--danger)', fontWeight: '600', fontSize: '12px' }}>
                    ⚠️ Exceeds limit by {charCount - charLimit} chars
                  </span>
                ) : generatedText ? (
                  <span style={{ color: 'var(--success)', fontWeight: '600', fontSize: '12px' }}>
                    ✓ Within limit ({charLimit - charCount} left)
                  </span>
                ) : null}
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
                  onClick={() => handleGenerate(`Shorten the evaluation so it strictly stays within ${charLimit} characters while preserving the core observations.`)}
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
                      <span className="history-meta">{entry.gender || 'Student'} • Grade {entry.grade} • {entry.charCount || entry.text?.length || 0} chars • {entry.timestamp}</span>
                    </div>
                    <div className="history-actions">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          setGeneratedText(entry.text);
                          setStudentName(entry.studentName);
                          if (entry.gender) setGender(entry.gender);
                          if (entry.grade) setGrade(entry.grade);
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
                AI Model & Provider Settings
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
              {/* Provider Selection */}
              <div className="form-group">
                <label className="form-label" htmlFor="provider-select">
                  AI Provider
                  <span className="hint">Free API options</span>
                </label>
                <select
                  id="provider-select"
                  className="form-select"
                  value={modalProvider}
                  onChange={e => {
                    const newProv = e.target.value;
                    setModalProvider(newProv);
                    setModalKey(apiKeys[newProv] || '');
                    const provObj = LLM_PROVIDERS.find(p => p.id === newProv);
                    if (provObj && provObj.models.length > 0) {
                      setModalModel(provObj.models[0].id);
                    }
                  }}
                >
                  {LLM_PROVIDERS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.badge}
                    </option>
                  ))}
                </select>
                <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  {LLM_PROVIDERS.find(p => p.id === modalProvider)?.helpText}
                </p>
              </div>

              {/* API Key */}
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label" htmlFor="api-key-input">
                  {LLM_PROVIDERS.find(p => p.id === modalProvider)?.name} API Key
                  <span className="hint">Saved in browser localStorage</span>
                </label>
                <input
                  id="api-key-input"
                  type="password"
                  className="form-input"
                  placeholder={LLM_PROVIDERS.find(p => p.id === modalProvider)?.keyPlaceholder || 'Enter API Key...'}
                  value={modalKey}
                  onChange={e => setModalKey(e.target.value)}
                />
                <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Need a key? Get one 100% free at:{' '}
                  <a 
                    href={LLM_PROVIDERS.find(p => p.id === modalProvider)?.keyHelpUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    style={{ color: 'var(--primary)', fontWeight: '600' }}
                  >
                    {LLM_PROVIDERS.find(p => p.id === modalProvider)?.name} Portal ↗
                  </a>
                </p>
              </div>

              {/* Model Select */}
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label" htmlFor="model-select">
                  Model
                  <span className="hint">Up-to-date models</span>
                </label>
                <select
                  id="model-select"
                  className="form-select"
                  value={
                    LLM_PROVIDERS.find(p => p.id === modalProvider)?.models.some(m => m.id === modalModel)
                      ? modalModel
                      : 'custom'
                  }
                  onChange={e => {
                    if (e.target.value !== 'custom') {
                      setModalModel(e.target.value);
                    }
                  }}
                >
                  {LLM_PROVIDERS.find(p => p.id === modalProvider)?.models.map(m => (
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
                    placeholder="e.g. gemini-3.8-flash or llama-3.3-70b-versatile"
                    value={modalModel}
                    onChange={e => setModalModel(e.target.value.trim())}
                    style={{ fontSize: '13px', fontFamily: 'monospace' }}
                  />
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '6px' }}>
                  {LLM_PROVIDERS.find(p => p.id === modalProvider)?.models.find(m => m.id === modalModel)?.desc ||
                   'Custom model configuration active.'}
                </p>
              </div>

              {/* Auto-Retry on Error / Timeout */}
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <label htmlFor="auto-retry-checkbox" style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🔁 Auto-retry on Error or Timeout</span>
                    </label>
                    <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                      Keeps retrying if the free API times out, returns an error, or gives an empty response.
                    </p>
                  </div>
                  <input
                    id="auto-retry-checkbox"
                    type="checkbox"
                    checked={modalAutoRetry}
                    onChange={e => setModalAutoRetry(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                </div>

                {modalAutoRetry && (
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label htmlFor="max-retries-input" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Maximum retry attempts:
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        id="max-retries-input"
                        type="number"
                        min="2"
                        max="15"
                        value={modalMaxRetries}
                        onChange={e => setModalMaxRetries(Math.max(1, Math.min(15, Number(e.target.value))))}
                        style={{ width: '64px', textAlign: 'center', padding: '4px 8px' }}
                        className="form-input"
                      />
                      <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>attempts</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowSettings(false)}>
                Cancel
              </button>
              <button 
                id="save-settings-btn"
                className="btn btn-primary" 
                onClick={() => handleSaveSettings(modalProvider, modalKey, modalModel, modalAutoRetry, modalMaxRetries)}
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
