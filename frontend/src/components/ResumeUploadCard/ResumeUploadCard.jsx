import { useRef } from 'react';
import './ResumeUploadCard.css';
import useFileUpload from '../../hooks/useFileUpload.js';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { VALIDATION } from '../../utils/constants.js';

/**
 * ResumeUploadCard — PDF file upload UI
 *
 * Responsibility: Presents a drag-and-drop zone and file input button.
 * Displays selected file info and error states.
 * All validation logic is in useFileUpload + Validator (not here).
 *
 * @param {File|null}   file          - Currently selected file
 * @param {string|null} error         - Validation error message
 * @param {Function}    onFileSelect  - Called with File object
 */
function ResumeUploadCard({ file, error, onFileSelect }) {
  const inputRef = useRef(null);

  const { isDragging, handleFileInput, handleDragOver, handleDragLeave, handleDrop } =
    useFileUpload(onFileSelect);

  const handleZoneClick = () => inputRef.current?.click();

  const handleRemoveFile = (e) => {
    e.stopPropagation(); // Don't trigger zone click
    onFileSelect(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024)       return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const hasFile   = !!file;
  const hasError  = !!error;

  let zoneClass = 'upload-zone';
  if (isDragging) zoneClass += ' upload-zone--dragging';
  if (hasFile)    zoneClass += ' upload-zone--has-file';
  if (hasError)   zoneClass += ' upload-zone--error';

  return (
    <div className="upload-card card animate-fade-in-up">
      {/* Card Header */}
      <div className="card__header">
        <div className="icon-wrap">
          <FileText size={18} aria-hidden="true" />
        </div>
        <div>
          <h2 className="card__title">Resume</h2>
          <p className="card__subtitle">Upload your PDF resume</p>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        id="resume-upload-zone"
        className={zoneClass}
        onClick={handleZoneClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label="Upload resume PDF. Click or drag and drop a file here."
        aria-describedby={hasError ? 'upload-error' : undefined}
        onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? handleZoneClick() : null}
      >
        {hasFile ? (
          /* File selected state */
          <div className="upload-zone__file-info">
            <div className="upload-zone__file-icon">
              <CheckCircle size={20} aria-hidden="true" />
            </div>
            <div className="upload-zone__file-details">
              <p className="upload-zone__filename" title={file.name}>{file.name}</p>
              <p className="upload-zone__filesize">{formatFileSize(file.size)} · PDF</p>
            </div>
            <button
              type="button"
              className="upload-zone__remove-btn"
              onClick={handleRemoveFile}
              aria-label={`Remove ${file.name}`}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        ) : (
          /* Empty/drag state */
          <div className="upload-zone__empty">
            <div className={`upload-zone__icon ${isDragging ? 'animate-bounce' : ''}`}>
              <Upload size={28} aria-hidden="true" />
            </div>
            <div className="upload-zone__text">
              <p className="upload-zone__primary-text">
                {isDragging ? 'Drop your PDF here' : 'Drag & drop your resume'}
              </p>
              <p className="upload-zone__secondary-text">
                or <span className="upload-zone__link">click to browse</span>
              </p>
            </div>
            <p className="upload-zone__hint">
              PDF only · Max {VALIDATION.FILE.MAX_SIZE_LABEL}
            </p>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        id="resume-file-input"
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={handleFileInput}
        aria-label="Upload PDF resume"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Inline Error */}
      {hasError && (
        <div id="upload-error" className="upload-card__error" role="alert">
          <AlertCircle size={14} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default ResumeUploadCard;
