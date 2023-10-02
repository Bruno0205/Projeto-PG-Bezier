class Ponto {
    constructor (novoX, novoY) {
        this.novoX = novoX
        this.novoY = novoY
    }
}

function novaInterpolacao(pontoA, pontoB, t) {
    return new Ponto(pontoA.novoX*(1-t) + pontoB.novoX*t, pontoA.novoY*(1-t) + pontoB.novoY*t)
}

function novoDeCasteljau(pontos, t) {
    const grau = pontos.length - 1
    if(grau === 1) {
        return novaInterpolacao(pontos[0], pontos[1], t)
    } else {
        const pontosAuxiliares = []
        for(let i = 0; i < grau; i++) {
            pontosAuxiliares.push(novaInterpolacao(pontos[i], pontos[i+1], t))
        }
        return novoDeCasteljau(pontosAuxiliares, t)
    }
}

const novoCanvas = document.getElementById('canvas')
const novoContexto = novoCanvas.getContext('2d')
const novoRetangulo = novoCanvas.getBoundingClientRect();

const criarNovaCurvaBotao = document.getElementById('btn-create-curve')
const apagarCurvaBotao = document.getElementById('btn-delete-curve')
const proximaCurvaBotao = document.getElementById('btn-next-curve')
const curvaAnteriorBotao = document.getElementById('btn-previous-curve')

const criarNovoPontoBotao = document.getElementById('btn-create-point')
const apagarPontoBotao = document.getElementById('btn-delete-point')
const editarPontoBotao = document.getElementById('btn-edit-point')
const proximoPontoBotao = document.getElementById('btn-next-point')
const pontoAnteriorBotao = document.getElementById('btn-previous-point')

const checkBoxCurvas = document.getElementById('btn-show-curves')
const checkBoxPoligonal = document.getElementById('btn-show-polygonal')
const checkBoxPontos = document.getElementById('btn-show-points')
const entradaAvaliacoes = document.getElementById('evaluations')

const RAIO_PONTO = 2

const novasCurvas = []
var curvaSelecionada = -1
var pontoSelecionado = []
pontoSelecionado.push(0)

var numeroAvaliacoes = 100

var estadoCanvas = 0
var clique = false
var pontosAparentes = true
var poligonalAparente = true
var curvasAparentes = true

function desenharPonto(pontoA) {
    novoContexto.beginPath()
    novoContexto.arc(pontoA.novoX, pontoA.novoY, RAIO_PONTO, 0, 2*Math.PI)
    novoContexto.stroke()
}

function desenharLinha(pontoA, pontoB) {
    novoContexto.beginPath()
    novoContexto.lineTo(pontoA.novoX, pontoA.novoY)
    novoContexto.lineTo(pontoB.novoX, pontoB.novoY)
    novoContexto.strokeStyle = '8px'
    novoContexto.stroke()
}

function desenharPoligonalControle(pontos) {
    for(let i = 0; i < pontos.length - 1; i++) {
        desenharLinha(pontos[i], pontos[i+1])
    }
}

function desenharCurvaBezier(pontos) {
    if(pontos.length > 2) {
        const curvasBezier = [];
        curvasBezier.push(pontos[0])
        for(let i = 1; i <= numeroAvaliacoes - 2; i++) {
            curvasBezier.push(novoDeCasteljau(pontos, i/numeroAvaliacoes))
        }
        curvasBezier.push(pontos[pontos.length - 1])
        desenharPoligonalControle(curvasBezier)
    }
}

function reDesenhar() {
    novoContexto.clearRect(0, 0, novoCanvas.width, novoCanvas.height)
    if(pontosAparentes) {
        for(let i = 0; i < novasCurvas.length; i++) {
            for(let j = 0; j < novasCurvas[i].length; j++) {
                if(j === pontoSelecionado[curvaSelecionada] && i === curvaSelecionada) {
                    novoContexto.strokeStyle = 'yellow'
                } else {
                    novoContexto.strokeStyle = 'green'
                }
                desenharPonto(novasCurvas[i][j])
            }
        }
    }
    if(poligonalAparente) {
        for(let i = 0; i < novasCurvas.length; i++) {
            if(i === curvaSelecionada) {
                novoContexto.strokeStyle = 'white'
            } else {
                novoContexto.strokeStyle = 'grey'
            }
            desenharPoligonalControle(novasCurvas[i])
        }
    }
    if(curvasAparentes && numeroAvaliacoes > 1) {
        for(let i = 0; i < novasCurvas.length; i++) {
            if(i === curvaSelecionada) {
                novoContexto.strokeStyle = 'red'
            } else [
                novoContexto.strokeStyle = 'blue'
            ]
            desenharCurvaBezier(novasCurvas[i])
        }
    }
}

novoCanvas.addEventListener('mousedown', function(event) {
    clique = true
    const elementoRelativoX = event.clientX - novoRetangulo.left;
    const elementoRelativoY = event.clientY - novoRetangulo.top;
    const canvasRelativoX = elementoRelativoX * novoCanvas.width / novoRetangulo.width;
    const canvasRelativoY = elementoRelativoY * novoCanvas.height / novoRetangulo.height;
    const pontoA = new Ponto(canvasRelativoX, canvasRelativoY)
    if(estadoCanvas === 1) {
        novasCurvas[curvaSelecionada].push(pontoA)
    } else if(estadoCanvas === 2) {
        novasCurvas[curvaSelecionada].splice(pontoSelecionado[curvaSelecionada], 1, pontoA)
    }
    reDesenhar()
})

novoCanvas.addEventListener('mousemove', function(event) {
    if(clique) {
        if(estadoCanvas === 2) {
            const elementoRelativoX = event.clientX - novoRetangulo.left;
            const elementoRelativoY = event.clientY - novoRetangulo.top;
            const canvasRelativoX = elementoRelativoX * novoCanvas.width / novoRetangulo.width;
            const canvasRelativoY = elementoRelativoY * novoCanvas.height / novoRetangulo.height;
            const pontoA = new Ponto(canvasRelativoX, canvasRelativoY)
            novasCurvas[curvaSelecionada].splice(pontoSelecionado[curvaSelecionada], 1, pontoA)
        }
    }
    reDesenhar()
})

novoCanvas.addEventListener('mouseup', function(event) {
    clique = false
    reDesenhar()
})

criarNovaCurvaBotao.addEventListener('click', function(event) {
    if(curvaSelecionada === -1 || novasCurvas[curvaSelecionada]?.length > 1) {
        estadoCanvas = 1
        const novaCurva = []
        novasCurvas.push(novaCurva)
        pontoSelecionado.push(0)
        curvaSelecionada++
    }
})

apagarCurvaBotao.addEventListener('click', function(event) {
    if(novasCurvas.length > 0) {
        novasCurvas.splice(curvaSelecionada, 1)
        pontoSelecionado.splice(curvaSelecionada, 1)
        if(curvaSelecionada > 0) {
            curvaSelecionada--
        }
        reDesenhar()
    } 
})

proximaCurvaBotao.addEventListener('click', function(event) {
    if(curvaSelecionada < novasCurvas.length - 1) {
        curvaSelecionada++
        reDesenhar()
    }
})

curvaAnteriorBotao.addEventListener('click', function(event) {
    if(curvaSelecionada > 0) {
        curvaSelecionada--
        reDesenhar()
    }
})

criarNovoPontoBotao.addEventListener('click', function(event) {
    estadoCanvas = 1
})

apagarPontoBotao.addEventListener('click', function(event) {
    if(novasCurvas[curvaSelecionada].length > 0) {
        novasCurvas[curvaSelecionada].splice(pontoSelecionado[curvaSelecionada], 1)
        if(novasCurvas[curvaSelecionada].length === 0) {
            novasCurvas.splice(curvaSelecionada, 1)
            pontoSelecionado.splice(curvaSelecionada, 1)
            if(curvaSelecionada > 0) {
                curvaSelecionada--
            }
            if(novasCurvas.length === 0) {
                curvaSelecionada = -1
            }
        }
        reDesenhar()
    } 
})

editarPontoBotao.addEventListener('click', function(event) {
    estadoCanvas = 2
})

proximoPontoBotao.addEventListener('click', function(event) {
    if(pontoSelecionado[curvaSelecionada] < novasCurvas[curvaSelecionada].length - 1) {
        pontoSelecionado[curvaSelecionada]++
        reDesenhar()
    } 
})

pontoAnteriorBotao.addEventListener('click', function(event) {
    if(pontoSelecionado[curvaSelecionada] > 0) {
        pontoSelecionado[curvaSelecionada]--
        reDesenhar()
    } 
})

checkBoxCurvas.addEventListener('click', function(event) {
    curvasAparentes = !curvasAparentes
    reDesenhar()
})

checkBoxPoligonal.addEventListener('click', function(event) {
    poligonalAparente = !poligonalAparente
    reDesenhar()
})

checkBoxPontos.addEventListener('click', function(event) {
    pontosAparentes = !pontosAparentes
    reDesenhar()
})

entradaAvaliacoes.addEventListener('keyup', function(event) {
    const entrada = event.target.value
    numeroAvaliacoes = parseInt(entrada)
    reDesenhar()
})
