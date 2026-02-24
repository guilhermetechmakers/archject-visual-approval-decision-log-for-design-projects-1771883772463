/* eslint-disable react-refresh/only-export-components -- context file exports provider + hook */
import * as React from 'react'
import type {
  DecisionEditorState,
  DecisionEditorStep,
  DecisionOptionForm,
  ApprovalRuleForm,
  TriggerForm,
  ReminderForm,
} from '@/types/decision-editor'
import { DEFAULT_EDITOR_STATE, EDITOR_STEPS } from '@/types/decision-editor'

interface DecisionEditorContextValue extends DecisionEditorState {
  step: DecisionEditorStep
  setStep: (step: DecisionEditorStep) => void
  updateMetadata: (data: Partial<Pick<DecisionEditorState, 'title' | 'description' | 'templateId' | 'typeName' | 'dueDate' | 'priority' | 'status'>>) => void
  setOptions: (options: DecisionOptionForm[]) => void
  addOption: (option: DecisionOptionForm) => void
  addOptionWithFiles: (files: FileList) => void
  updateOption: (id: string, data: Partial<DecisionOptionForm>) => void
  removeOption: (id: string) => void
  reorderOptions: (fromIndex: number, toIndex: number) => void
  setApprovalRules: (rules: ApprovalRuleForm[]) => void
  addApprovalRule: (rule: ApprovalRuleForm) => void
  updateApprovalRule: (id: string, data: Partial<ApprovalRuleForm>) => void
  removeApprovalRule: (id: string) => void
  setTriggers: (triggers: TriggerForm[]) => void
  addTrigger: (trigger: TriggerForm) => void
  updateTrigger: (id: string, data: Partial<TriggerForm>) => void
  removeTrigger: (id: string) => void
  setReminders: (reminders: ReminderForm[]) => void
  addReminder: (reminder: ReminderForm) => void
  updateReminder: (id: string, data: Partial<ReminderForm>) => void
  removeReminder: (id: string) => void
  setAssignee: (assigneeId: string | null) => void
  reset: (initial?: Partial<DecisionEditorState>) => void
  canGoToStep: (step: DecisionEditorStep) => boolean
}

const DecisionEditorContext = React.createContext<DecisionEditorContextValue | null>(null)

function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function DecisionEditorProvider({
  children,
  initial,
}: {
  children: React.ReactNode
  initial?: Partial<DecisionEditorState>
}) {
  const [state, setState] = React.useState<DecisionEditorState>({
    ...DEFAULT_EDITOR_STATE,
    ...initial,
  })
  const [step, setStep] = React.useState<DecisionEditorStep>('metadata')

  const stepIndex = EDITOR_STEPS.findIndex((s) => s.id === step)

  const canGoToStep = React.useCallback(
    (targetStep: DecisionEditorStep): boolean => {
      const targetIndex = EDITOR_STEPS.findIndex((s) => s.id === targetStep)
      if (targetIndex <= stepIndex) return true
      if (targetStep === 'metadata') return true
      if (targetStep === 'options') return true
      if (targetStep === 'comparison') return state.options.length > 0
      if (targetStep === 'approval') return true
      if (targetStep === 'assignee') return true
      if (targetStep === 'integrations') return true
      if (targetStep === 'review') return state.title.length > 0
      return false
    },
    [stepIndex, state.options.length, state.title]
  )

  const updateMetadata = React.useCallback(
    (data: Partial<Pick<DecisionEditorState, 'title' | 'description' | 'templateId' | 'typeName' | 'dueDate' | 'priority' | 'status'>>) => {
      setState((s) => ({ ...s, ...data }))
    },
    []
  )

  const setOptions = React.useCallback((options: DecisionOptionForm[]) => {
    setState((s) => ({ ...s, options }))
  }, [])

  const addOption = React.useCallback((option: DecisionOptionForm) => {
    setState((s) => ({
      ...s,
      options: [...s.options, { ...option, id: option.id || generateId() }],
    }))
  }, [])

  const addOptionWithFiles = React.useCallback((files: FileList) => {
    const newMedia = Array.from(files).map((file) => ({
      id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      fileName: file.name,
      url: URL.createObjectURL(file),
      type: (file.type.startsWith('image/') ? 'image' : file.type === 'application/pdf' ? 'pdf' : 'bim') as 'image' | 'pdf' | 'cad' | 'bim',
      size: file.size,
      version: 1,
      uploadedAt: new Date().toISOString(),
      isPrimary: false,
    }))
    if (newMedia.length > 0) newMedia[0].isPrimary = true
    const newOption: DecisionOptionForm = {
      id: generateId(),
      title: `Option 1`,
      order: 0,
      mediaFiles: newMedia,
      version: 1,
    }
    setState((s) => ({
      ...s,
      options: [...s.options, newOption],
    }))
  }, [])

  const updateOption = React.useCallback((id: string, data: Partial<DecisionOptionForm>) => {
    setState((s) => ({
      ...s,
      options: s.options.map((o) => (o.id === id ? { ...o, ...data } : o)),
    }))
  }, [])

  const removeOption = React.useCallback((id: string) => {
    setState((s) => ({
      ...s,
      options: s.options.filter((o) => o.id !== id),
    }))
  }, [])

  const reorderOptions = React.useCallback((fromIndex: number, toIndex: number) => {
    setState((s) => {
      const opts = [...s.options]
      const [removed] = opts.splice(fromIndex, 1)
      opts.splice(toIndex, 0, removed)
      return {
        ...s,
        options: opts.map((o, i) => ({ ...o, order: i })),
      }
    })
  }, [])

  const setApprovalRules = React.useCallback((rules: ApprovalRuleForm[]) => {
    setState((s) => ({ ...s, approvalRules: rules }))
  }, [])

  const addApprovalRule = React.useCallback((rule: ApprovalRuleForm) => {
    setState((s) => ({
      ...s,
      approvalRules: [...s.approvalRules, { ...rule, id: rule.id || generateId() }],
    }))
  }, [])

  const updateApprovalRule = React.useCallback((id: string, data: Partial<ApprovalRuleForm>) => {
    setState((s) => ({
      ...s,
      approvalRules: s.approvalRules.map((r) => (r.id === id ? { ...r, ...data } : r)),
    }))
  }, [])

  const removeApprovalRule = React.useCallback((id: string) => {
    setState((s) => ({
      ...s,
      approvalRules: s.approvalRules.filter((r) => r.id !== id),
    }))
  }, [])

  const setTriggers = React.useCallback((triggers: TriggerForm[]) => {
    setState((s) => ({ ...s, triggers }))
  }, [])

  const addTrigger = React.useCallback((trigger: TriggerForm) => {
    setState((s) => ({
      ...s,
      triggers: [...s.triggers, { ...trigger, id: trigger.id || generateId() }],
    }))
  }, [])

  const updateTrigger = React.useCallback((id: string, data: Partial<TriggerForm>) => {
    setState((s) => ({
      ...s,
      triggers: s.triggers.map((t) => (t.id === id ? { ...t, ...data } : t)),
    }))
  }, [])

  const removeTrigger = React.useCallback((id: string) => {
    setState((s) => ({
      ...s,
      triggers: s.triggers.filter((t) => t.id !== id),
    }))
  }, [])

  const setReminders = React.useCallback((reminders: ReminderForm[]) => {
    setState((s) => ({ ...s, reminders }))
  }, [])

  const addReminder = React.useCallback((reminder: ReminderForm) => {
    setState((s) => ({
      ...s,
      reminders: [...s.reminders, { ...reminder, id: reminder.id || generateId() }],
    }))
  }, [])

  const updateReminder = React.useCallback((id: string, data: Partial<ReminderForm>) => {
    setState((s) => ({
      ...s,
      reminders: s.reminders.map((r) => (r.id === id ? { ...r, ...data } : r)),
    }))
  }, [])

  const removeReminder = React.useCallback((id: string) => {
    setState((s) => ({
      ...s,
      reminders: s.reminders.filter((r) => r.id !== id),
    }))
  }, [])

  const setAssignee = React.useCallback((assigneeId: string | null) => {
    setState((s) => ({ ...s, assigneeId }))
  }, [])

  const reset = React.useCallback((initialState?: Partial<DecisionEditorState>) => {
    setState({ ...DEFAULT_EDITOR_STATE, ...initialState })
    setStep('metadata')
  }, [])

  const value: DecisionEditorContextValue = {
    ...state,
    step,
    setStep,
    updateMetadata,
    setOptions,
    addOption,
    addOptionWithFiles,
    updateOption,
    removeOption,
    reorderOptions,
    setApprovalRules,
    addApprovalRule,
    updateApprovalRule,
    removeApprovalRule,
    setTriggers,
    addTrigger,
    updateTrigger,
    removeTrigger,
    setReminders,
    addReminder,
    updateReminder,
    removeReminder,
    setAssignee,
    reset,
    canGoToStep,
  }

  return (
    <DecisionEditorContext.Provider value={value}>
      {children}
    </DecisionEditorContext.Provider>
  )
}

export function useDecisionEditor(): DecisionEditorContextValue {
  const ctx = React.useContext(DecisionEditorContext)
  if (!ctx) {
    throw new Error('useDecisionEditor must be used within DecisionEditorProvider')
  }
  return ctx
}
