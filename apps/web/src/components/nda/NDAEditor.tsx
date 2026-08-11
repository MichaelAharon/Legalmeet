'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Input, Textarea } from '@legalmeet/ui';

/**
 * NDA content editor with optional template-variable substitution.
 *
 * Callers that toggle between editor and signing UI must keep this component
 * mounted (e.g. hide with CSS) or remount with `initialContent` set to the
 * latest saved draft. Remounting with the original template / empty string
 * will overwrite parent draft state via onChange and permanently lose edits.
 */
interface NDAEditorProps {
  initialContent: string;
  templateVars?: Array<{ name: string; label: string; type: string; required: boolean }>;
  onChange: (content: string) => void;
  autoFillValues?: Record<string, string>;
}

export function NDAEditor({ initialContent, templateVars = [], onChange, autoFillValues }: NDAEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [varValues, setVarValues] = useState<Record<string, string>>({});
  const autoFilled = useRef(false);

  // Auto-fill values from meeting info on mount
  useEffect(() => {
    if (autoFillValues && !autoFilled.current) {
      setVarValues(prev => {
        const merged = { ...prev };
        for (const [key, value] of Object.entries(autoFillValues)) {
          if (value && !merged[key]) {
            merged[key] = value;
          }
        }
        return merged;
      });
      autoFilled.current = true;
    }
  }, [autoFillValues]);

  // Parse variables from content if none provided
  const vars = useMemo(() => {
    if (templateVars.length > 0) return templateVars;
    const matches = content.match(/\{\{(\w+)\}\}/g) || [];
    const names = [...new Set(matches.map(m => m.replace(/[{}]/g, '')))];
    return names.map(name => ({
      name,
      label: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      type: name.includes('date') ? 'date' : 'text',
      required: true,
    }));
  }, [content, templateVars]);

  // Apply variable replacements to generate preview
  const previewContent = useMemo(() => {
    let result = content;
    for (const [key, value] of Object.entries(varValues)) {
      if (value) {
        result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
      }
    }
    return result;
  }, [content, varValues]);

  useEffect(() => {
    onChange(previewContent);
  }, [previewContent, onChange]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">NDA Content</label>
        <Textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={12}
          className="font-mono text-sm"
        />
      </div>

      {vars.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Template Variables
            {autoFillValues && Object.keys(autoFillValues).some(k => autoFillValues[k]) && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 ml-2 font-normal">
                (auto-filled from meeting info)
              </span>
            )}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {vars.map(v => (
              <Input
                key={v.name}
                label={v.label}
                type={v.type === 'date' ? 'date' : 'text'}
                value={varValues[v.name] || ''}
                onChange={e => setVarValues({ ...varValues, [v.name]: e.target.value })}
                placeholder={`Enter ${v.label.toLowerCase()}`}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Preview</label>
        <div className="max-h-64 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border text-sm font-mono whitespace-pre-wrap">
          {previewContent}
        </div>
      </div>
    </div>
  );
}
