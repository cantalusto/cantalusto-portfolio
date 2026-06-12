# Lucas Cantarelli — Portfólio

Portfólio interativo estilo awwwards: dark noir com acento vermelho-sangue, WebGL, smooth scroll e micro-interações.

## Stack

- **HTML/CSS/JS puro** — sem build, deploy direto
- **GSAP 3.13** (ScrollTrigger + SplitText) — reveals, parallax, contadores
- **Lenis** — smooth scroll
- **Three.js** — campo de partículas reativo ao mouse no hero (shader customizado)
- Fontes: Clash Display + General Sans (Fontshare)

## Rodar localmente

```bash
python3 -m http.server 8000
# http://localhost:8000
```

(Precisa de servidor por causa dos ES modules — abrir o arquivo direto não funciona.)

## Deploy na Vercel

```bash
npx vercel --prod
```

Ou conecte o repositório no painel da Vercel — é site estático, nenhuma configuração necessária.

## Estrutura

```
index.html          página única
css/style.css       todo o estilo
js/main.js          GSAP, Lenis, cursor, menu, preloader
js/scene.js         cena Three.js do hero
assets/lucas.jpeg   foto (seção Sobre)
assets/projects/    screenshots dos projetos (preview no hover)
```

## Notas

- **Acessibilidade**: com `prefers-reduced-motion` ativo, animações e WebGL são desligados e o conteúdo aparece direto.
- **Screenshots dos projetos**: capturas locais dos sites no ar. Para atualizar, tire novos screenshots (1350×900) e salve em `assets/projects/`.
- Sem WebGL disponível, o hero degrada graciosamente para fundo estático.
