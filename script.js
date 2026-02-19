const STORAGE_KEY = 'wedding_rsvp_entries';

const tabButtons = document.querySelectorAll('.tab-button');
const tabPanels = document.querySelectorAll('.tab-panel');

const rsvpForm = document.getElementById('rsvpForm');
const quantidadeInput = document.getElementById('quantidade');
const nomesConvidados = document.getElementById('nomesConvidados');
const temCriancaInput = document.getElementById('temCrianca');
const criancasArea = document.getElementById('criancasArea');
const quantidadeCriancasInput = document.getElementById('quantidadeCriancas');
const criancasLista = document.getElementById('criancasLista');
const feedback = document.getElementById('feedback');

const totalConfirmacoes = document.getElementById('totalConfirmacoes');
const adminBody = document.getElementById('adminBody');
const limparTudoBtn = document.getElementById('limparTudo');

function getEntries() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function createGuestNameFields(total) {
  nomesConvidados.innerHTML = '';
  for (let i = 1; i <= total; i += 1) {
    const label = document.createElement('label');
    label.textContent = `Nome convidado ${i}`;

    const input = document.createElement('input');
    input.type = 'text';
    input.required = true;
    input.name = `convidado_${i}`;
    input.placeholder = `Convidado ${i}`;

    label.appendChild(input);
    nomesConvidados.appendChild(label);
  }
}

function createChildrenFields(total) {
  criancasLista.innerHTML = '';
  for (let i = 1; i <= total; i += 1) {
    const wrapper = document.createElement('div');
    wrapper.className = 'child-row';

    const nome = document.createElement('input');
    nome.type = 'text';
    nome.required = true;
    nome.name = `crianca_nome_${i}`;
    nome.placeholder = `Nome da criança ${i}`;

    const idade = document.createElement('input');
    idade.type = 'number';
    idade.min = '0';
    idade.required = true;
    idade.name = `crianca_idade_${i}`;
    idade.placeholder = `Idade ${i}`;

    wrapper.appendChild(nome);
    wrapper.appendChild(idade);
    criancasLista.appendChild(wrapper);
  }
}

function setTab(tabId) {
  tabButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  tabPanels.forEach((panel) => {
    panel.classList.toggle('active', panel.id === tabId);
  });
}

function renderAdmin() {
  const entries = getEntries();
  totalConfirmacoes.textContent = String(entries.length);

  if (!entries.length) {
    adminBody.innerHTML = '<tr><td colspan="4">Nenhuma confirmação ainda.</td></tr>';
    return;
  }

  adminBody.innerHTML = '';
  entries.forEach((entry, index) => {
    const tr = document.createElement('tr');

    const convidadosHtml = `<ul>${entry.convidados
      .map((nome) => `<li>${nome}</li>`)
      .join('')}</ul>`;

    const criancasHtml = entry.criancas.length
      ? `<ul>${entry.criancas
          .map((c) => `<li>${c.nome} (${c.idade} anos)</li>`)
          .join('')}</ul>`
      : 'Não';

    tr.innerHTML = `
      <td>${entry.responsavel}</td>
      <td>${convidadosHtml}</td>
      <td>${criancasHtml}</td>
      <td><button data-remove="${index}" class="danger">Remover</button></td>
    `;

    adminBody.appendChild(tr);
  });
}

function resetForm() {
  rsvpForm.reset();
  quantidadeInput.value = '1';
  quantidadeCriancasInput.value = '1';
  criancasArea.classList.add('hidden');
  createGuestNameFields(1);
  createChildrenFields(1);
}

tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => setTab(btn.dataset.tab));
});

quantidadeInput.addEventListener('input', () => {
  const total = Math.max(1, Number(quantidadeInput.value) || 1);
  createGuestNameFields(total);
});

temCriancaInput.addEventListener('change', () => {
  const enabled = temCriancaInput.checked;
  criancasArea.classList.toggle('hidden', !enabled);
});

quantidadeCriancasInput.addEventListener('input', () => {
  const total = Math.max(1, Number(quantidadeCriancasInput.value) || 1);
  createChildrenFields(total);
});

rsvpForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const convidados = [...nomesConvidados.querySelectorAll('input')].map((input) =>
    input.value.trim()
  );

  const criancas = temCriancaInput.checked
    ? [...criancasLista.querySelectorAll('.child-row')].map((row) => {
        const [nomeInput, idadeInput] = row.querySelectorAll('input');
        return {
          nome: nomeInput.value.trim(),
          idade: Number(idadeInput.value),
        };
      })
    : [];

  if (convidados.some((nome) => !nome)) {
    feedback.textContent = 'Preencha todos os nomes dos convidados.';
    return;
  }

  if (criancas.some((item) => !item.nome || Number.isNaN(item.idade))) {
    feedback.textContent = 'Preencha os dados das crianças corretamente.';
    return;
  }

  const entry = {
    responsavel: document.getElementById('responsavel').value.trim(),
    quantidade: Number(quantidadeInput.value),
    convidados,
    criancas,
    enviadoEm: new Date().toISOString(),
  };

  const entries = getEntries();
  entries.push(entry);
  saveEntries(entries);

  feedback.textContent = 'Confirmação enviada com sucesso!';
  renderAdmin();
  resetForm();
});

adminBody.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-remove]');
  if (!button) {
    return;
  }

  const index = Number(button.dataset.remove);
  const entries = getEntries();
  entries.splice(index, 1);
  saveEntries(entries);
  renderAdmin();
});

limparTudoBtn.addEventListener('click', () => {
  if (!confirm('Tem certeza que deseja apagar todas as confirmações?')) {
    return;
  }

  saveEntries([]);
  renderAdmin();
});

createGuestNameFields(1);
createChildrenFields(1);
renderAdmin();
