/**
 * Helpers de construction DOM surs.
 *
 * Objectif : "Securiser l'interface contre les failles courantes du client
 * (comme l'injection de scripts ou faille XSS)".
 *
 * Toute donnee provenant du serveur (nom du patient, commentaire, acte, email...)
 * est injectee via textContent / setAttribute et jamais via innerHTML, afin
 * qu'un contenu malveillant ne puisse pas etre execute dans le navigateur.
 */

/**
 * Cree un element HTML sans interpreter son contenu comme du HTML.
 * @param {string} tag
 * @param {{text?: *, className?: string, attributes?: object, dataset?: object}} [options]
 * @returns {HTMLElement}
 */
export function createElement(tag, { text, className = "", attributes = {}, dataset = {} } = {}) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined && text !== null) {
    element.textContent = String(text);
  }

  for (const [name, value] of Object.entries(attributes)) {
    if (value === undefined || value === null) continue;
    element.setAttribute(name, String(value));
  }

  for (const [name, value] of Object.entries(dataset)) {
    if (value === undefined || value === null) continue;
    element.dataset[name] = String(value);
  }

  return element;
}

/**
 * Cree une cellule de tableau (td) dont le contenu est du texte brut.
 * @param {*} text
 * @param {string} [className]
 * @param {string} [label] libelle de la colonne (affiche en mode responsive)
 * @returns {HTMLTableCellElement}
 */
export function createCell(text, className = "", label = "") {
  const cell = document.createElement("td");
  if (className) {
    cell.className = className;
  }
  if (label) {
    // Le libelle est repris par la regle CSS ".responsive td::before"
    // pour afficher l'intitule de la colonne en mode carte (mobile).
    cell.dataset.label = label;
  }
  cell.textContent = text === undefined || text === null ? "" : String(text);
  return cell;
}

/**
 * Cree une ligne de tableau.
 * Chaque cellule peut etre une valeur simple (texte) ou un element HTML deja construit.
 * @param {Array<*>} cells
 * @param {string[]} [labels] libelles de colonnes, dans l'ordre
 * @returns {HTMLTableRowElement}
 */
export function createRow(cells = [], labels = []) {
  const row = document.createElement("tr");

  cells.forEach((cell, index) => {
    if (cell instanceof HTMLElement) {
      if (labels[index]) {
        cell.dataset.label = labels[index];
      }
      row.appendChild(cell);
    } else {
      row.appendChild(createCell(cell, "", labels[index] || ""));
    }
  });

  return row;
}

/**
 * Vide un conteneur sans passer par innerHTML.
 * @param {HTMLElement|null} node
 */
export function clearElement(node) {
  if (!node) return;
  node.replaceChildren();
}

/**
 * Cree une ligne d'erreur (message statique, jamais de donnee serveur).
 * @param {number} colspan
 * @param {string} message
 * @param {string} [style]
 * @returns {HTMLTableRowElement}
 */
export function createErrorRow(colspan, message, style = "") {
  const row = document.createElement("tr");
  const cell = document.createElement("td");
  cell.colSpan = colspan;
  if (style) cell.setAttribute("style", style);
  cell.textContent = message;
  row.appendChild(cell);
  return row;
}
