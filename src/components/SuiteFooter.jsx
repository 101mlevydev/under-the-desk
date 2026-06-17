import React from 'react';
import { SUITE, SELF_ID } from '../lib/suite.js';

// Slim cross-promo footer: surfaces the other BGU apps. A pill with an empty
// url is rendered but inert (links get filled in at launch).
export default function SuiteFooter() {
  const others = SUITE.filter((a) => a.id !== SELF_ID);
  return (
    <footer className="suite-footer" dir="rtl">
      <span className="suite-label">עוד כלים לחיי בן-גוריון 👇</span>
      <span className="suite-pills">
        {others.map((a) =>
          a.url ? (
            <a
              key={a.id}
              className="suite-pill"
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span aria-hidden="true">{a.emoji}</span> {a.name}
            </a>
          ) : (
            <span key={a.id} className="suite-pill is-inert" aria-disabled="true">
              <span aria-hidden="true">{a.emoji}</span> {a.name}
            </span>
          )
        )}
      </span>
    </footer>
  );
}
