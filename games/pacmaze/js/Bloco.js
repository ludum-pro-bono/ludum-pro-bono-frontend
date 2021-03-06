class Bloco extends GameObject {
    constructor(cor = 'blue', corBorda = 'deepskyblue', raio = 0, size = 30) {
        super('bloco', size);
        this.size = size;
        this.cor = cor;

        this.dom.style.backgroundColor = cor;
        this.dom.style.border = 'solid 3px ' + corBorda;
        this.dom.style.boxSizing = 'border-box';
        this.dom.style.borderRadius = raio;

        this.setPosition({ x: window.innerWidth, y: window.innerHeight });
    }

    removerObjeto(indice) {
        super.removerObjeto();
        delete blocos[indice];
    }
}