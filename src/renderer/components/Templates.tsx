import React from 'react';
import { useLang } from '../LangContext';
import { Lang } from '../i18n';

export interface Template {
  id: string;
  name: string;
  icon: string;
  content: string;
}

function getTemplates(lang: Lang): Template[] {
  if (lang === 'pl') {
    return [
      {
        id: 'meeting',
        name: 'Spotkanie',
        icon: '📋',
        content: `<h2>Spotkanie</h2><p><strong>Data:</strong> </p><p><strong>Uczestnicy:</strong> </p><h3>Agenda</h3><ul><li><p></p></li></ul><h3>Notatki</h3><p></p><h3>Akcje do podjecia</h3><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p></p></li></ul>`,
      },
      {
        id: 'todo',
        name: 'Lista zadan',
        icon: '✓',
        content: `<h2>Lista zadan</h2><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p>Zadanie 1</p></li><li data-type="taskItem" data-checked="false"><p>Zadanie 2</p></li><li data-type="taskItem" data-checked="false"><p>Zadanie 3</p></li></ul>`,
      },
      {
        id: 'journal',
        name: 'Dziennik',
        icon: '✎',
        content: `<h2>Dziennik</h2><p><strong>Jak sie dzis czuje:</strong> </p><h3>Co sie wydarzylo</h3><p></p><h3>Za co jestem wdzieczny</h3><ul><li><p></p></li></ul><h3>Plan na jutro</h3><ul><li><p></p></li></ul>`,
      },
      {
        id: 'project',
        name: 'Projekt',
        icon: '◈',
        content: `<h2>Projekt: </h2><p><strong>Status:</strong> W trakcie</p><p><strong>Deadline:</strong> </p><h3>Cel</h3><p></p><h3>Zadania</h3><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p></p></li></ul><h3>Notatki</h3><p></p>`,
      },
      {
        id: 'brainstorm',
        name: 'Burza mozgow',
        icon: '◉',
        content: `<h2>Burza mozgow: </h2><h3>Problem</h3><p></p><h3>Pomysly</h3><ul><li><p></p></li></ul><h3>Wnioski</h3><p></p><h3>Nastepne kroki</h3><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p></p></li></ul>`,
      },
    ];
  }

  return [
    {
      id: 'meeting',
      name: 'Meeting',
      icon: '📋',
      content: `<h2>Meeting</h2><p><strong>Date:</strong> </p><p><strong>Attendees:</strong> </p><h3>Agenda</h3><ul><li><p></p></li></ul><h3>Notes</h3><p></p><h3>Action items</h3><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p></p></li></ul>`,
    },
    {
      id: 'todo',
      name: 'Task list',
      icon: '✓',
      content: `<h2>Task list</h2><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p>Task 1</p></li><li data-type="taskItem" data-checked="false"><p>Task 2</p></li><li data-type="taskItem" data-checked="false"><p>Task 3</p></li></ul>`,
    },
    {
      id: 'journal',
      name: 'Journal',
      icon: '✎',
      content: `<h2>Journal</h2><p><strong>How I feel today:</strong> </p><h3>What happened</h3><p></p><h3>What I am grateful for</h3><ul><li><p></p></li></ul><h3>Plan for tomorrow</h3><ul><li><p></p></li></ul>`,
    },
    {
      id: 'project',
      name: 'Project',
      icon: '◈',
      content: `<h2>Project: </h2><p><strong>Status:</strong> In progress</p><p><strong>Deadline:</strong> </p><h3>Goal</h3><p></p><h3>Tasks</h3><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p></p></li></ul><h3>Notes</h3><p></p>`,
    },
    {
      id: 'brainstorm',
      name: 'Brainstorm',
      icon: '◉',
      content: `<h2>Brainstorm: </h2><h3>Problem</h3><p></p><h3>Ideas</h3><ul><li><p></p></li></ul><h3>Conclusions</h3><p></p><h3>Next steps</h3><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p></p></li></ul>`,
    },
  ];
}

interface Props {
  onSelect: (template?: Template) => void;
  onClose: () => void;
}

function TemplateModal({ onSelect, onClose }: Props) {
  const { t, lang } = useLang();
  const templates = getTemplates(lang);

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
              <span className="template-name">{tmpl.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TemplateModal;
