// Lista de palavras de 5 letras (sem acentos para simplicidade)
const lista = [
  "CARTA", "FELIZ", "AMIGO", "BRISA", "MUNDO",
  "LIVRO", "JOGAR", "PLANO", "FRETE", "AROMA",
  "PRAIA", "NAVEG", "SONHO", "FORTE", "LUGAR",
  "CASAS", "VIVER", "RAIOS", "FUROS", "MAGIA"
];

// Estado do jogo
let palavra = "";
let tentativas = 0;
const maxTentativas = 6;
let ganhou = false;
let chuteAtual = "";

const tecladoLayout = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["Enter","Z","X","C","V","B","N","M","←"]
];

function escolhaAleatoria() {
  const idx = Math.floor(Math.random() * lista.length);
  return lista[idx];
}

function novoJogo() {
  palavra = escolhaAleatoria();
  tentativas = 0;
  ganhou = false;
  chuteAtual = "";
  document.getElementById("resultado").innerHTML = "";
  document.getElementById("status").textContent = "Jogo iniciado! Boa sorte.";
  atualizarDisplay();
  resetTeclado();
  console.log("Palavra secreta (para dev):", palavra); // pode remover depois
}

// inicializa teclado visual
function montarTeclado() {
  const container = document.getElementById("keyboard");
  container.innerHTML = "";
  tecladoLayout.forEach(row => {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("key-row");
    row.forEach(key => {
      const keyDiv = document.createElement("div");
      keyDiv.textContent = key;
      keyDiv.classList.add("key");
      if (key === "Enter" || key === "←") keyDiv.classList.add("small");
      keyDiv.addEventListener("click", () => handleKey(key));
      keyDiv.id = `key-${key}`;
      rowDiv.appendChild(keyDiv);
    });
    container.appendChild(rowDiv);
  });
}

function resetTeclado() {
  const all = document.querySelectorAll(".key");
  all.forEach(k => {
    k.classList.remove("certa", "existe", "errada");
  });
}

// chamada ao clicar em tecla
function handleKey(key) {
  if (ganhou || tentativas >= maxTentativas) return;
  if (key === "Enter") {
    chutar();
  } else if (key === "←") {
    apagar();
  } else if (/^[A-Z]$/.test(key)) {
    if (chuteAtual.length < 5) {
      chuteAtual += key;
      atualizarDisplay();
    }
  }
}

// apagar última letra
function apagar() {
  if (ganhou || tentativas >= maxTentativas) return;
  chuteAtual = chuteAtual.slice(0, -1);
  atualizarDisplay();
}

// exibe chute atual no "fake input"
function atualizarDisplay() {
  const disp = document.getElementById("display-guess");
  disp.textContent = chuteAtual;
}

// chamada no botão Enter
function chutar() {
  if (ganhou || tentativas >= maxTentativas) return;
  if (chuteAtual.length !== 5) {
    alert("Digite exatamente 5 letras!");
    return;
  }
  if (!/^[A-Z]+$/.test(chuteAtual)) {
    alert("Só letras A-Z (sem acentos).");
    return;
  }

  tentativas++;
  mostrarResultado(chuteAtual);
  atualizarTeclado(chuteAtual);
  chuteAtual = "";
  atualizarDisplay();

  if (chuteAtual === "" && !ganhou) {
    // verifique se ganhou ou acabou
    // (ganhou já seria marcado dentro mostrarResultado)
  }
}

function mostrarResultado(tentativa) {
  const divResultado = document.getElementById("resultado");
  const linha = document.createElement("div");

  const solArray = palavra.split("");
  const feedback = Array(5).fill("absent");

  // corretas
  for (let i = 0; i < 5; i++) {
    if (tentativa[i] === solArray[i]) {
      feedback[i] = "correct";
      solArray[i] = null;
    }
  }

  // presentes
  for (let i = 0; i < 5; i++) {
    if (feedback[i] === "correct") continue;
    const idx = solArray.indexOf(tentativa[i]);
    if (idx !== -1) {
      feedback[i] = "present";
      solArray[idx] = null;
    }
  }

  // renderiza
  for (let i = 0; i < 5; i++) {
    const letraDiv = document.createElement("div");
    letraDiv.classList.add("letra");
    letraDiv.textContent = tentativa[i];

    if (feedback[i] === "correct") {
      letraDiv.classList.add("certa");
      setTimeout(() => {
        letraDiv.classList.add("bounce");
        letraDiv.addEventListener("animationend", () => {
          letraDiv.classList.remove("bounce");
        }, { once: true });
      }, 50);
    } else if (feedback[i] === "present") {
      letraDiv.classList.add("existe");
    } else {
      letraDiv.classList.add("errada");
    }

    linha.appendChild(letraDiv);
  }

  divResultado.appendChild(linha);

  // status
  if (tentativa === palavra) {
    ganhou = true;
    document.getElementById("status").textContent = `🎉 Parabéns! Você acertou em ${tentativas} tentativa(s).`;
  } else if (tentativas >= maxTentativas) {
    document.getElementById("status").textContent = `❌ Acabaram as tentativas. A palavra era: ${palavra}`;
  } else {
    document.getElementById("status").textContent = `Tentativa ${tentativas} de ${maxTentativas}.`;
  }
}

// atualiza cores do teclado com base nos chutes anteriores
function atualizarTeclado(tentativa) {
  const solArray = palavra.split("");
  const feedback = Array(5).fill("absent");

  for (let i = 0; i < 5; i++) {
    if (tentativa[i] === solArray[i]) {
      feedback[i] = "correct";
      solArray[i] = null;
    }
  }
  for (let i = 0; i < 5; i++) {
    if (feedback[i] === "correct") continue;
    const idx = solArray.indexOf(tentativa[i]);
    if (idx !== -1) {
      feedback[i] = "present";
      solArray[idx] = null;
    }
  }

  for (let i = 0; i < 5; i++) {
    const letter = tentativa[i];
    const keyEl = document.getElementById(`key-${letter}`);
    if (!keyEl) continue;
    // prioridade: correct > present > absent
    if (feedback[i] === "correct") {
      keyEl.classList.remove("existe", "errada");
      keyEl.classList.add("certa");
    } else if (feedback[i] === "present") {
      if (!keyEl.classList.contains("certa")) {
        keyEl.classList.remove("errada");
        keyEl.classList.add("existe");
      }
    } else {
      if (!keyEl.classList.contains("certa") && !keyEl.classList.contains("existe")) {
        keyEl.classList.add("errada");
      }
    }
  }
}

// captura teclado físico
document.addEventListener("keydown", (e) => {
  if (ganhou || tentativas >= maxTentativas) return;
  const key = e.key.toUpperCase();
  if (key === "ENTER") {
    chutar();
  } else if (key === "BACKSPACE") {
    apagar();
  } else if (/^[A-Z]$/.test(key)) {
    if (chuteAtual.length < 5) {
      chuteAtual += key;
      atualizarDisplay();
    }
  }
});

// inicia
montarTeclado();
novoJogo();
