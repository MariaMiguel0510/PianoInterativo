let video;
let corpo;
let bodies = [];

let barras = [];
let nb = 9;//número de barras/teclas

let pontos = [];
let som = [];
let cor = [];
let tol = [];
let alturasPretos = [];
let randomBodyPart = [];

function preload() {
    corpo = ml5.bodyPose("BlazePose", { flipped: true });
}

function gotBody(resultsB) {
    bodies = resultsB;
}

function setup() {

    createCanvas(innerWidth, innerHeight);
    largura = width / nb;

    //tolerancia de cada barra por causa da distancia entre os movimentos
    tol = [10, 80, 80, 30, 30, 30, 30, 30, 30];

    //percorre todas as barras/teclas 
    for (let i = 0; i < nb; i++) {
        cor[i] = color(random(255), random(255), random(255), 20);//define uma cor aleatoria para cada barra
        pontos.push({ x: 0, y: 0 });
        som[i] = loadSound("data/som" + i + ".mp3");
        alturasPretos[i] = 0.3 * window.innerHeight;//define a altura dos retangulos pretos
    }

    // define o número aleatório da parte do corpo que vai ser atribuído à barra
    while (randomBodyPart.length < 9) {
        let numero = floor(random(9));
        if (!randomBodyPart.includes(numero)) {
            randomBodyPart.push(numero);
        }
    }

    video = createCapture(VIDEO, { flipped: true });
    video.hide();
    corpo.detectStart(video, gotBody);
    noStroke();

}

function draw() {
    background(255);

    let keypointsIndices = [0, 15, 16, 14, 13, 25, 26, 27, 28]; // índices dos pontos do corpo/esqueleto

    for (let i = 0; i < bodies.length; i++) {
        let pessoa = bodies[i];

        for (let j = 0; j < nb; j++) {
            let pontoIndex = keypointsIndices[randomBodyPart[j]]; // índice aleatório
            mover(pessoa.keypoints[pontoIndex], tol[j], som[j], j); //aplica em todos os pontos a função
        }
    }

    desenharBarras();
}

// função para detectar movimento e adicionar barras
function mover(ponto, tolerancia, som, indice) {
    if (ponto.confidence > 0.5) {
        let distanciaMov = dist(ponto.x, ponto.y, pontos[indice].x, pontos[indice].y);

        //se o movimento do ponto do corpo for maior que a tolerância 
        if (distanciaMov > tolerancia) {
            let novaAltura = map(ponto.y, height, 0, 0, height * 1.2);
            let posX = indice * (width / nb);

            //desenha novas barras sobre as outras
            barras.push({
                altura: novaAltura,
                cor: cor[indice],
                posicaoX: posX
            });

            pontos[indice].x = ponto.x;
            pontos[indice].y = ponto.y;

            //o som toca
            som.play();

            // aumenta temporariamente a altura do retângulo preto correspondente
            alturasPretos[indice] = height * 0.43;

            // a altura dos retângulos pretos volta ao normal 
            setTimeout(() => alturasPretos[indice] = height * 0.3, 300);
        }
    }
}

// desenha as teclas de fundo (barras coloridas)
function desenharBarras() {
    for (let i = 0; i < barras.length; i++) {
        noStroke();
        fill(barras[i].cor);
        rect(barras[i].posicaoX, 0, largura, barras[i].altura);
    }

    // desenha as teclas pretas
    for (let i = 0; i < nb; i++) {
        let meioX = (i * (largura) + (largura) / 2);
        let larguraRet = (largura) * 0.4;

        fill(0);
        noStroke();
        rect(meioX - larguraRet / 2, 0, larguraRet, alturasPretos[i]);

        noFill();
        for (let y = 0; y < height; y++) {
            let gradiente = lerpColor(color(0, 0, 0, 30), color(255, 255, 255, 30), map(y, 0, height, 0, 1));
            stroke(gradiente);
            line(i * largura, y, i * largura, y + 1); //linhas de separação de teclas
        }
    }
}
