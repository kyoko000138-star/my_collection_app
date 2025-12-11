// src/game/useDialogue.ts
import { useCallback, useState } from 'react';
import type { DialogueLine, DialogueScript } from './dialogueTypes';

interface UseDialogueResult {
  currentLine: DialogueLine | null;
  visible: boolean;
  startScript: (script: DialogueScript, onComplete?: () => void) => void;
  next: () => void;
}

export function useDialogue(): UseDialogueResult {
  const [script, setScript] = useState<DialogueScript | null>(null);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [onComplete, setOnComplete] = useState<(() => void) | undefined>();

  const startScript = useCallback(
    (s: DialogueScript, complete?: () => void) => {
      setScript(s);
      setIndex(0);
      setVisible(true);
      setOnComplete(() => complete);
    },
    []
  );

  const next = useCallback(() => {
    if (!script) return;
    const nextIndex = index + 1;

    if (nextIndex >= script.lines.length) {
      setVisible(false);
      setScript(null);
      setIndex(0);
      if (onComplete) onComplete();
      return;
    }

    setIndex(nextIndex);
  }, [script, index, onComplete]);

  const currentLine: DialogueLine | null =
    script && script.lines.length > 0 ? script.lines[index] : null;

  return { currentLine, visible, startScript, next };
}
