import React from 'react';
import { useLang } from '../LangContext';

export interface Template {
  id: string;
  name: string;
  icon: string;
  content: string;
}

export const templates: Template[] = [
  {
    id: 'meeting',
    name: 'Spotkanie',
    icon: '📋',
    content: `<h2>Spotkanie</h2><p><strong>Data:</strong> </p><p><strong>Uczestnicy:</strong> </p><h3>Agenda</h3><ul><li><p></p></li></ul><h3>Notatki</h3><p></p><h3>Akcje do podjęcia</h3><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p></p></li></ul>`,
  },
  {
    id: 'todo',
    name: 'Lista zadań',
    icon: '✓',
    content: `<h2>Lista zadań</h2><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p>Zadanie 1</p></li><li data-type="taskItem" data-checked="false"><p>Zadanie 2</p></li><li data-type="taskItem" data-checked="false"><p>Zadanie 3</p></li></ul>`,
  },
  {
    id: 'journal',
    name: 'Dziennik',
    icon: '✎',
    content: `<h2>Dziennik</h2><p><strong>Jak się dziś czuję:</strong> </p><h3>Co się wydarzyło</h3><p></p><h3>Za co jestem wdzięczny</h3><ul><li><p></p></li></ul><h3>Plan na jutro</h3><ul><li><p></p></li></ul>`,
  },
  {
    id: 'project',
    name: 'Projekt',
    icon: '◈',
    content: `<h2>Projekt: </h2><p><strong>Status:</strong> W trakcie</p><p><strong>Deadline:</strong> </p><h3>Cel</h3><p></p><h3>Zadania</h3><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p></p></li></ul><h3>Notatki</h3><p></p>`,
  },
  {
    id: 'brainstorm',
    name: 'Burza mózgów',
    icon: '◉',
    content: `<h2>Burza mózgów: </h2><h3>Problem</h3><p></p><h3>Pomysły</h3><ul><li><p></p></li></ul><h3>Wnioski</h3><p></p><h3>Następne kroki</h3><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p></p></li></ul>`,
  },
];

interface Props {
  onSelect: (template?: Template) => void;
  onClose: () => void;
}

function TemplateModal({ onSelect, onClose }: Props) {
  const { t } = useLang();

  const templateNames: Record<string, () => string> = {
    meeting: () => t('templateMeeting'),
    todo: () => t('templateTodo'),
    journal: () => t('templateJournal'),
    project: () => t('templateProject'),
    brainstorm: () => t('templateBrainstorm'),
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <h3>{t('newNoteTitle')}</h3>
        <div className="templates-grid">
          <button className="template-card" onClick={() => onSelect(undefined)}>
            <span className="template-icon">+</span>
            <span className="template-name">{t('templateEmpty')}</span>
          </button>
          {templates.map((tmpl) => (
            <button key={tmpl.id} className="template-card" onClick={() => onSelect(tmpl)}>
              <span className="template-icon">{tmpl.icon}</span>
              <span className="template-name">{templateNames[tmpl.id] ? templateNames[tmpl.id]() : tmpl.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TemplateModal;
