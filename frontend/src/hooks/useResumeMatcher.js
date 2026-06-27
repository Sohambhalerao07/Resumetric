/**
 * useResumeMatcher — Main orchestrator hook
 *
 * WHY: This hook owns the complete resume-matching workflow state machine.
 * Components are dumb — they display state and call actions.
 * All business logic, validation, API calls, and state transitions live here.
 *
 * State machine:
 *   idle → [file selected + jd entered] → ready → analyzing → done
 *                                                      ↓
 *                                                   error
 */

import { useState, useCallback, useMemo } from 'react';
import ApiService from '../services/ApiService.js';
import Validator  from '../services/Validator.js';
import MatchResult from '../services/MatchResult.js';
import { ANALYSIS_STEPS } from '../utils/constants.js';
import logger from '../utils/logger.js';

const log = logger.child('useResumeMatcher');

function useResumeMatcher(toast) {
  // --- File State ---
  const [file,           setFile]           = useState(null);
  const [fileError,      setFileError]      = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // --- Text State ---
  const [jobDescription, setJobDescription] = useState('');
  const [textError,      setTextError]      = useState(null);

  // --- Analysis State ---
  const [isAnalyzing,      setIsAnalyzing]      = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0); // step index
  const [analysisError,    setAnalysisError]    = useState(null);

  // --- Results State ---
  const [result,       setResult]       = useState(null);
  const [hasAnalyzed,  setHasAnalyzed]  = useState(false);

  // --- Computed: is the form ready to submit? ---
  const isReadyToAnalyze = useMemo(() => {
    return file !== null && jobDescription.trim().length >= 50 && !isAnalyzing;
  }, [file, jobDescription, isAnalyzing]);

  // ─────────────────────────────────────────────────────────────────────────
  // FILE ACTIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Called when a file is selected (from upload card).
   * Validates immediately and updates state.
   */
  const handleFileSelect = useCallback((selectedFile) => {
    const validation = Validator.validatePDFFile(selectedFile);

    if (!validation.valid) {
      setFileError(validation.error);
      setFile(null);
      toast?.error(validation.error);
      log.warn('File rejected', { error: validation.error });
      return;
    }

    setFile(selectedFile);
    setFileError(null);
    setUploadProgress(0);
    // Clear previous results when a new file is selected
    setResult(null);
    setHasAnalyzed(false);
    setAnalysisError(null);
    log.info('File accepted', { name: selectedFile.name, size: selectedFile.size });
    toast?.success(`"${selectedFile.name}" ready for analysis`);
  }, [toast]);

  // ─────────────────────────────────────────────────────────────────────────
  // TEXT ACTIONS
  // ─────────────────────────────────────────────────────────────────────────

  const handleJobDescriptionChange = useCallback((text) => {
    setJobDescription(text);

    // Clear error once the user starts typing valid content
    if (textError && text.trim().length >= 50) {
      setTextError(null);
    }
  }, [textError]);

  // ─────────────────────────────────────────────────────────────────────────
  // ANALYSIS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Runs the full analysis workflow.
   * State transitions: idle → analyzing → done | error
   */
  const analyze = useCallback(async () => {
    // Pre-flight validation
    const formValidation = Validator.validateFormSubmission(file, jobDescription);
    if (!formValidation.valid) {
      setAnalysisError(formValidation.error);
      toast?.error(formValidation.error);
      return;
    }

    log.info('Starting analysis workflow');

    // Reset state for new analysis
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisProgress(0);
    setResult(null);
    setUploadProgress(0);

    try {
      // Simulate step progression for better UX
      // Real progress comes from upload callback; AI steps are time-estimated
      const stepInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          const next = prev + 1;
          return next < ANALYSIS_STEPS.length - 1 ? next : prev;
        });
      }, 3_000); // Advance a step every 3s

      const rawResponse = await ApiService.analyzeResume(
        file,
        jobDescription,
        (progress) => {
          setUploadProgress(progress);
          if (progress === 100) {
            setAnalysisProgress(1); // File uploaded, move to extract step
          }
        }
      );

      clearInterval(stepInterval);
      setAnalysisProgress(ANALYSIS_STEPS.length - 1); // Jump to final step

      // Small delay so the user sees the final step
      await new Promise(resolve => setTimeout(resolve, 600));

      // Backend returns { success: true, data: { score, ... } }
      // MatchResult.create() expects the inner data object
      const analysisData = rawResponse?.data ?? rawResponse;
      const formatted = MatchResult.create(analysisData);
      setResult(formatted);
      setHasAnalyzed(true);
      log.info('Analysis workflow complete', { score: formatted.score });
      toast?.success(`Analysis complete! Match score: ${formatted.score}%`);

    } catch (error) {
      log.error('Analysis workflow failed', { error: error.message });
      const message = error.message || 'Analysis failed. Please try again.';
      setAnalysisError(message);
      toast?.error(message);

    } finally {
      setIsAnalyzing(false);
      setUploadProgress(0);
    }
  }, [file, jobDescription, toast]);

  // ─────────────────────────────────────────────────────────────────────────
  // RESET
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Resets the entire form and results to initial state.
   */
  const reset = useCallback(() => {
    setFile(null);
    setFileError(null);
    setUploadProgress(0);
    setJobDescription('');
    setTextError(null);
    setIsAnalyzing(false);
    setAnalysisProgress(0);
    setAnalysisError(null);
    setResult(null);
    setHasAnalyzed(false);
    log.info('State reset');
  }, []);

  /**
   * Manual form validation (e.g. for validation feedback before submit)
   */
  const validateForm = useCallback(() => {
    const fileResult = Validator.validatePDFFile(file);
    if (!fileResult.valid) {
      setFileError(fileResult.error);
      return false;
    }

    const jdResult = Validator.validateJobDescription(jobDescription);
    if (!jdResult.valid) {
      setTextError(jdResult.error);
      return false;
    }

    return true;
  }, [file, jobDescription]);

  return {
    // File
    file,
    fileError,
    uploadProgress,
    handleFileSelect,

    // Text
    jobDescription,
    textError,
    handleJobDescriptionChange,

    // Analysis
    isAnalyzing,
    analysisProgress,
    analysisSteps: ANALYSIS_STEPS,
    analysisError,
    isReadyToAnalyze,

    // Results
    result,
    hasAnalyzed,

    // Actions
    analyze,
    reset,
    validateForm,
  };
}

export default useResumeMatcher;
