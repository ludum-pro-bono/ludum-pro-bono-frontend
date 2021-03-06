class Game {
    constructor({ nome, linkImagem, linkIndex, linkGif, tituloDescricao, descricao, controles }) {
        this.dom = $('<div>');
        this.linkIndex = linkIndex;
        this.nome = nome;

        const img = $('<img>');
        const nomeDiv = $('<div>');

        nomeDiv.addClass('nome');
        nomeDiv.html(nome);
        img.attr('src', linkImagem);

        this.dom.addClass('game');
        this.dom.addClass('grayscale');
        this.dom.append(img);
        this.dom.append(nomeDiv);

        controles = controles.replace(/\n/g, '<br>');
        controles = controles.replace(/}/g, '</span>');
        controles = controles.replace(/{/g, '<span style="font-weit: bold">');

        this.dom
            .attr('gif', linkGif)
            .attr('descricao', descricao)
            .attr('tituloDescricao', tituloDescricao)
            .attr('controles', controles);

        $('#games').append(this.dom);

        this.addOnClick(linkIndex);

        games.push(this);
    }

    addOnClick(linkIndex) {
        this.dom.click(() => {
            window.location.href = linkIndex;
        });
    }
}

function removerSelect() {
    games.forEach(game => {
        game.dom.removeClass('selecionado').addClass('grayscale').removeClass('subselecionado');
    });
}

function selecionar() {
    const game = $(games[gameSelecionado].dom);
    game.addClass('selecionado').removeClass('grayscale');

    $(game).prev().addClass('subselecionado');
    $(game).next().addClass('subselecionado');

    $('#info > img').attr('src', game.attr('gif'));
    $('#tituloDescricao').html(game.attr('tituloDescricao'));
    $('#descricao').html(game.attr('descricao'));
    $('#controles').html(game.attr('controles'));
}

function abrirSelecionado() {
    window.location.href = games[gameSelecionado].linkIndex;
}

function waitFor(tempo, callback) {
    const intervalo = setInterval(() => {
        clearInterval(intervalo);
        callback();
    }, tempo);

}

function allGames(callback) {
    games.forEach((game, indice) => {
        callback(game.dom, indice);
    });
}

function slide(sentido, duracao = 500) {
    allGames((game, indice) => {
        if (sentido == 'up') {
            game.slideUp(duracao);
        }
        else if (sentido == 'down') {
            game.slideDown(duracao);
        }
    });
}

function backGame() {
    if (permitirSelecao) {
        permitirSelecao = false;
        removerSelect();
        transicao('selecionado', 'direita');
        transicao('prev', 'meio');
        gameSelecionado -= 1;
        selecionar();
        atualizarRanking()
    }
}

function nextGame() {
    if (permitirSelecao) {
        permitirSelecao = false;
        removerSelect();
        transicao('selecionado', 'esquerda');
        transicao('next', 'meio');
        gameSelecionado += 1;
        selecionar();
        atualizarRanking()
    }
}

function transicao(card = 'selecionado', destino = 'meio', tempo = 250) {
    var game, prev, next;

    if (gameSelecionado == 0) {
        prev = $(games[games.length - 1].dom);
    }
    else prev = $(games[gameSelecionado].dom).prev();

    if (gameSelecionado == games.length - 1) {
        next = $(games[0].dom);
    }
    else next = $(games[gameSelecionado].dom).next();

    prev.css('left', -288);
    next.css('left', window.innerWidth + 50);

    switch (card) {
        case 'selecionado':
            game = $(games[gameSelecionado].dom);
            break;
        case 'prev':
            game = prev;
            if (gameSelecionado == 0) gameSelecionado = games.length;
            break;
        case 'next':
            game = next;
            if (gameSelecionado == games.length - 1) gameSelecionado = -1;
            break;
    }

    const callback = () => permitirSelecao = true;

    switch (destino) {
        case 'meio':
            game.animate({ left: (window.innerWidth / 2) - 130 }, tempo, callback);
            break;
        case 'direita':
            game.animate({ left: (window.innerWidth + 50) }, tempo, callback);
            break;
        case 'esquerda':
            game.animate({ left: - 288 }, tempo, callback);
            break;
    }
}

function addPlayer(colocacao, nome) {
    const $ranking = $('#ranking-body')
    const $colocacao = $('<td>')
    const $nome = $('<td>')

    if (colocacao <= 3 && colocacao > 0) {
        var img = $('<img>').attr('src', path.join(__dirname, `../assets/img/medalhas/${colocacao}.png`))
        $colocacao.html($('<div>').append(img))
    } else {
        $colocacao.html($('<div>').append(colocacao + 'º'))
    }

    $nome.html(nome)

    $ranking.append($('<tr>')
        .append($colocacao)
        .append($nome))
}

function atualizarRanking() {
    $('#ranking').load('./../ranking/showRanking/ajaxRanking.html').ready(() => {
        request.get(serverAddress + '/ranking/' + games[gameSelecionado].nome, (e, res, body) => {
            console.log(body)
            JSON.parse(body).forEach((player, indice) => {
                addPlayer(indice + 1, player.nome)
            })
        })
    })
}

document.addEventListener('keydown', e => { // Alguma tecla pressionada
    // e.preventDefault();

    switch (e.keyCode) {
        case keys.left: // Esquerda
            backGame();
            break;

        case keys.up: // Cima
            break;

        case keys.right: // Direita
            nextGame();
            break;

        case keys.down: // Baixo
            break;

        case keys.start:
            if (tempoParado < tempoLimite) abrirSelecionado();
            break;

        case keys.action1:
            localStorage.setItem("ranking",
                JSON.stringify({ context: window.location.href, nomeJogo: games[gameSelecionado].nome }));
            window.location.href = '../ranking/showRanking/index.html';
            break;

        case keys.menu:
            // window.close();
            break;
    }

    // audio.play();
    if (tempoParado >= tempoLimite) {
        transicao(undefined, undefined, 0);
        slide('down');
        $('#info').slideDown(500);
    }
    tempoParado = 0;
});

const audio = document.getElementById('musicaAbertura');
audio.loop = true;
audio.volume = 1;

var games = [];
var gameSelecionado = 0;
const tempoLimite = 30;
var tempoParado = tempoLimite;
var permitirSelecao = false;

new Game({
    nome: 'Snake calculator',
    linkImagem: '../assets/img/games/cards/snake.png',
    linkIndex: '../games/snake/index.html',
    linkGif: '../assets/img/games/gifs/snake.gif',
    tituloDescricao: 'Snake - Matemática',
    descricao: 'O jogo Snake tem como objetivo desenvolver raciocínio matemático, exigindo uma resposta rápida e correta além de possibilitar formas mais rápidas e eficientes de chegar a ela.',
    controles: '{Setas}: Movimenta a Snake.'
});

new Game({
    nome: 'Flappy Becker',
    linkImagem: '../assets/img/games/cards/flappy-becker.png',
    linkIndex: '../games/flappy-becker/index.html',
    linkGif: '../assets/img/games/gifs/flappy-becker.gif',
    tituloDescricao: 'Flappy Becker - Química',
    descricao: 'O jogo Flappy Becker tem como objetivo auxiliar o jogador a identificar as principais moléculas através da sua nomenclatura, assim desenvolvendo um raciocínio rápido e reflexos devido a sua jogabilidade.',
    controles: '{Setas}: Qualquer uma faz o Flappy Becker Saltar.\n{A, B, C, D}: Faz o Flappy Becker Saltar'
});

new Game({
    nome: 'Estados Brasileiros',
    linkImagem: '../assets/img/games/cards/estados-brasileiros.png',
    linkIndex: '../games/estados-brasileiros/index.html',
    linkGif: '../assets/img/games/gifs/estados-brasileiros.gif',
    tituloDescricao: 'Estados Brasileiros - Geografia',
    descricao: 'O jogo Estados Brasileiros tem como objetivo auxiliar o jogador a aprender os principais estados através da jogabilidade de perguntas e respostas com um período de tempo a ser respondido, assim desenvolvendo habilidades como memória, raciocínio, reflexo e relacionar a forma dos estados com seus respectivos nomes.',
    controles: '{A, B, C, D}: Corresponde às respectivas respostas.'
});

new Game({
    nome: 'Simon',
    linkImagem: '../assets/img/games/cards/simon-memory.png',
    linkIndex: '../games/simon-memory/index.html',
    linkGif: '../assets/img/games/gifs/simon.gif',
    tituloDescricao: 'Simon - Memória',
    descricao: 'O jogo Simon tem como objetivo desenvolver a memória do jogador desafiando o mesmo decorar o maior número de sequencias possíveis sem errar.',
    controles: '{Setas}: Corresponde à posição das cores do jogo.'
});

new Game({
    nome: 'Pacmaze',
    linkImagem: '../assets/img/games/cards/pacmaze.png',
    linkIndex: '../games/pacmaze/index.html',
    linkGif: '../assets/img/games/gifs/pacmaze.gif',
    tituloDescricao: 'Pacmaze - Raciocínio lógico',
    descricao: 'O jogo Pacmaze tem como objetivo incentivar o jogador a desenvolver um raciocínio rápido, capacidade de pensar logicamente e de realizar cálculos mentais tendo de passar por uma determinada fase com o menor número de movimentos  possíveis.',
    controles: '{Setas}: Move o Pacman pelo cenário.\n{D}: Reinicia a fase.'
});

new Game({
    nome: 'Bomberdev',
    linkImagem: '../assets/img/games/cards/bomberman.png',
    linkIndex: '../games/bomberdev/index.html',
    linkGif: '../assets/img/games/gifs/bomberdev.gif',
    tituloDescricao: 'Bomberdev – Algoritmo',
    descricao: 'O jogo Bomberdev, inspirado no clássico Bomberman tem como objetivo desenvolver o raciocínio lógico do jogador e principalmente suas habilidades algorítmicas, pois o jogador deverá montar uma estrutura de instruções que satisfaça os desafios da fase.',
    controles: `
        {Setas}: Movimentação pelo fluxograma.
        {A}: Ativa ou desativa a realocação da instrução selecionada.
        {Enter}: Executa as instruções do fluxograma principal.
    `
});

games[0].dom.addClass('selecionado');
selecionar();

atualizarRanking()