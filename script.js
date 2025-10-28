const form = document.getElementById('negocieForm');
const relatorioDiv = document.getElementById('relatorio');
let dadosClientes = [];
let registrosCliente = [];

// Carregar dados do TXT
async function carregarArquivo() {
  const response = await fetch("dados.txt");
  const texto = await response.text();
  const linhas = texto.split("\n").map(l => l.trim()).filter(l => l);

  dadosClientes = linhas.slice(1).map(linha => {
    const partes = linha.split(";").map(p => p.trim());
    return {
      cnpj: partes[0],
      cliente: partes[1],
      razao: partes[2],
      consultor: partes[3],
      emissao: partes[4],
      vencimento: partes[5],
      nf: partes[6],
      parcela: partes[7],
      valorTitulo: parseFloat(partes[8].replace(",", ".")) || 0,
      valorPago: parseFloat(partes[9].replace(",", ".")) || 0,
      saldo: parseFloat(partes[10].replace(",", ".")) || 0,
    };
  });
}
carregarArquivo();

// Ao digitar o código
document.getElementById("codigo").addEventListener("change", function() {
  const codigo = this.value.trim().toUpperCase();
  registrosCliente = dadosClientes.filter(c => c.cliente.toUpperCase() === codigo);

  if (registrosCliente.length > 0) {
    const cliente = registrosCliente[0];
    document.getElementById("razao").value = cliente.razao;
    document.getElementById("cnpj").value = cliente.cnpj;
    document.getElementById("consultor").value = cliente.consultor;
    mostrarTabela(registrosCliente);
  } else {
    // Limpa os inputs e a tabela
    document.getElementById("razao").value = "";
    document.getElementById("cnpj").value = "";
    document.getElementById("consultor").value = "";
    relatorioDiv.innerHTML = "";
  }
});


document.querySelectorAll('input[name="cienteDebito"]').forEach(el => {
    el.addEventListener('change', () => {
      if (el.checked) {
        document.querySelectorAll('input[name="cienteDebito"]').forEach(other => {
          if (other !== el) other.checked = false;
        });
      }
    });
  });

  document.querySelectorAll('input[name="contatoCliente"]').forEach(el => {
    el.addEventListener('change', () => {
      if (el.checked) {
        document.querySelectorAll('input[name="contatoCliente"]').forEach(other => {
          if (other !== el) other.checked = false;
        });
      }
    });
  });

// Formatar número de telefone enquanto digita
const celularInput = document.getElementById("celular");

celularInput.addEventListener("input", (e) => {
  let valor = e.target.value.replace(/\D/g, ""); // Remove tudo que não for número

  if (valor.length > 11) valor = valor.slice(0, 11); // Limita a 11 dígitos

  if (valor.length <= 10) {
    valor = valor.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  } else {
    valor = valor.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  }

  e.target.value = valor.trim();
});


// Montar tabela com títulos
function mostrarTabela(registros) {
  let html = `
    <h2>Títulos do Cliente</h2>
    <table>
      <thead>
        <tr>
          <th>Razão Social</th>
          <th>CNPJ</th>
          <th>Consultor</th>
          <th>N° NF</th>
          <th>Parcela</th>
          <th>Emissão</th>
          <th>Vencimento</th>
          <th>Valor Título (R$)</th>
          <th>Valor Pago (R$)</th>
          <th>Saldo (R$)</th>
        </tr>
      </thead>
      <tbody>
  `;

  registros.forEach(r => {
    html += `
      <tr>
        <td>${r.razao}</td>
        <td>${r.cnpj}</td>
        <td>${r.consultor}</td>
        <td>${r.nf}</td>
        <td>${r.parcela}</td>
        <td>${r.emissao}</td>
        <td>${r.vencimento}</td>
        <td>${r.valorTitulo.toFixed(2)}</td>
        <td>${r.valorPago.toFixed(2)}</td>
        <td>${r.saldo.toFixed(2)}</td>
      </tr>`;
  });

  html += `</tbody></table>`;
  relatorioDiv.innerHTML = html;
}

// Resumo e envio via WhatsApp
form.addEventListener("submit", e => {
  e.preventDefault();

  if (registrosCliente.length === 0) {
    alert("Digite um código de cliente válido antes de gerar o resumo.");
    return;
  }

  const contato = document.getElementById("contato").value;
  const celular = document.getElementById("celular").value;

 const totalAberto = registrosCliente.reduce((acc, r) => acc + r.saldo, 0);

// Captura as respostas dos checkboxes
const ciente = document.querySelector('input[name="cienteDebito"]:checked');
const contatoCliente = document.querySelector('input[name="contatoCliente"]:checked');

const cienteTexto = ciente ? ciente.value : "Não informado";
const contatoClienteTexto = contatoCliente ? contatoCliente.value : "Não informado";

let texto = `📌 *NEGÓCIE JÁ*\n\n👤 *Pessoa para contato:* ${contato}\n📱 *Celular:* ${celular}\n\n📊 *Resumo dos títulos:*\n\n`;

registrosCliente.forEach((r, i) => {
  texto += `🧾 *Título ${i + 1}*\n`;
  texto += `• Razão Social: ${r.razao}\n`;
  texto += `• CNPJ: ${r.cnpj}\n`;
  texto += `• Consultor: ${r.consultor}\n`;
  texto += `• NF: ${r.nf} | Parcela: ${r.parcela}\n`;
  texto += `• Emissão: ${r.emissao} | Vencimento: ${r.vencimento}\n`;
  texto += `• Valor Título: R$ ${r.valorTitulo.toFixed(2)}\n`;
  texto += `• Valor Pago: R$ ${r.valorPago.toFixed(2)}\n`;
  texto += `• Saldo: R$ ${r.saldo.toFixed(2)}\n\n`;
});

texto += `💰 *Total em aberto:* R$ ${totalAberto.toFixed(2)}\n`;
texto += `📋 *Cliente está ciente do débito?* ${cienteTexto}\n`;
texto += `📞 *Contato alinhado com o cliente?* ${contatoClienteTexto}\n\n`;


  // Mostra no modal
  const modal = document.getElementById("modalConfirmacao");
  const modalTexto = document.getElementById("modalTexto");
  modalTexto.textContent = texto;
  modal.style.display = "flex";

  document.getElementById("btnConfirmar").onclick = () => {
    const numeroDestino = "5585991745188";
    const linkWhats = `https://wa.me/${numeroDestino}?text=${encodeURIComponent(texto)}`;
    window.open(linkWhats, "_blank");
    modal.style.display = "none";
  };

  document.getElementById("btnFechar").onclick = () => modal.style.display = "none";
  window.onclick = e => { if (e.target === modal) modal.style.display = "none"; };
});
