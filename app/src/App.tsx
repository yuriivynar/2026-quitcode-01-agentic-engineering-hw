import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  PButton,
  PDivider,
  PHeading,
  PInputEmail,
  PInputText,
  PSelect,
  PSelectOption,
  PTag,
  PText,
  PTextarea,
} from "@porsche-design-system/components-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  budget: number;
  message: string;
  segment: "hot" | "cold";
  createdAt: string;
}

const URGENCY = /(терміново|urgent|asap|якнайшвидше)/i;
const STORAGE_KEY = "quitcode-lead-desk";

function loadLeads(): Lead[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as Lead[];
  } catch {
    return [];
  }
}

export default function App() {
  const [leads, setLeads] = useState<Lead[]>(loadLeads);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    } catch {
      /* private mode — ok */
    }
  }, [leads]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    const message = String(data.get("message") ?? "").trim();
    const budget = Number(data.get("budget") ?? 0);
    if (!name || !email.includes("@") || !message) return;

    const lead: Lead = {
      id: crypto.randomUUID(),
      name,
      email,
      budget,
      message,
      segment: budget >= 1000 || URGENCY.test(message) ? "hot" : "cold",
      createdAt: new Date().toLocaleString("uk-UA"),
    };
    setLeads((prev) => [lead, ...prev]);
    form.reset();
  };

  const hot = leads.filter((l) => l.segment === "hot").length;

  return (
    <main className="page">
      <header className="header">
        <PHeading size="x-large" tag="h1">
          Lead Desk
        </PHeading>
        <PText color="contrast-medium">
          Заявки клієнтів агенції: форма → список з пріоритетом hot / cold.
          Воркшоп 01 · вайб-кодинг на Porsche Design System.
        </PText>
      </header>

      <section className="card">
        <PHeading size="medium" tag="h2">
          Нова заявка
        </PHeading>
        <form onSubmit={onSubmit} className="form">
          <div className="row">
            <PInputText label="Ім'я" name="name" required />
            <PInputEmail label="Email" name="email" required />
          </div>
          <div className="row">
            <PSelect label="Бюджет, $" name="budget" value="300">
              <PSelectOption value="300">до 500</PSelectOption>
              <PSelectOption value="700">500 – 999</PSelectOption>
              <PSelectOption value="2500">1 000 – 4 999</PSelectOption>
              <PSelectOption value="7000">5 000+</PSelectOption>
            </PSelect>
            <PTextarea
              label="Повідомлення"
              name="message"
              required
              rows={3}
            />
          </div>
          <div className="actions">
            <PButton type="submit">Додати заявку</PButton>
            <PButton
              type="button"
              variant="secondary"
              hidden={leads.length === 0}
              onClick={() => setLeads([])}
            >
              Очистити список
            </PButton>
          </div>
        </form>
      </section>

      <section className="card">
        <div className="list-header">
          <PHeading size="medium" tag="h2">
            Заявки
          </PHeading>
          <div className="stats">
            <PTag variant="primary">🔥 hot: {hot}</PTag>
            <PTag>❄️ cold: {leads.length - hot}</PTag>
          </div>
        </div>

        {leads.length === 0 ? (
          <PText color="contrast-medium">
            Поки порожньо — додайте першу заявку.
          </PText>
        ) : (
          <ul className="leads">
            {leads.map((lead) => (
              <li key={lead.id}>
                <div className="lead-top">
                  <PText weight="semi-bold">{lead.name}</PText>
                  <PTag variant={lead.segment === "hot" ? "primary" : "secondary"}>
                    {lead.segment === "hot" ? "🔥 hot" : "❄️ cold"}
                  </PTag>
                </div>
                <PText size="x-small" color="contrast-medium">
                  {lead.email} · ${lead.budget} · {lead.createdAt}
                </PText>
                <PText size="small">{lead.message}</PText>
                <PDivider className="divider" />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
