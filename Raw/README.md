# Raw/ — caixa de entrada para importar material

Esta é a **caixa de entrada** do gerador. Você dropa aqui os arquivos de um tema
(imagens da marca + textos soltos sobre ela) e pede pro Jotaro organizar com
`/importa`. Ele monta um **projeto pronto** em `projects/<nome>/` a partir do que
encontrar.

## Como usar

Você tem duas formas de soltar material:

- **Uma pasta por tema** — crie `Raw/<tema>/` e jogue tudo daquele tema dentro.
  Cada subpasta vira **um projeto**.

  ```
  Raw/
    minha-marca/
      personagem-frente.png
      personagem-perfil.png
      sobre-a-marca.txt
      historia.md
  ```

- **Arquivos soltos na raiz** — solte direto em `Raw/`. Tudo que estiver solto
  conta como **um lote avulso** (`_avulso`), que vira um projeto só.

Depois é só pedir: **"Jotaro, importa o Raw"** ou rodar `/importa`. Ele lê os
textos, decide o que é marca / narrativa / roteiro, infere o nome e o tipo do
projeto, **mostra o plano e pede sua aprovação** — e só então cria o projeto,
move as imagens e esvazia o lote.

## Detalhes

- O Jotaro **move** os arquivos (Raw é caixa de entrada que esvazia). Nada é
  movido nem apagado sem você aprovar o plano antes.
- **O conteúdo do Raw não é versionado** — só este `README.md` e o `.gitkeep`
  ficam no git. As imagens e textos que você soltar aqui ficam só na sua máquina
  até serem organizados num projeto.
- Tipos de arquivo: imagens (`png`, `jpg`, `jpeg`, `webp`) viram referências
  visuais; textos (`md`, `txt`) viram marca / narrativa / roteiro. Outros tipos
  são sinalizados pra você decidir.
