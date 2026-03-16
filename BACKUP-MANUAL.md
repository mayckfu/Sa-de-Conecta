# 🕰️ Máquina do Tempo do Projeto (Guia de Backup)

Parabéns! O seu projeto agora tem um sistema de **Controle de Versão (Git)** ativo. 
Isso significa que você pode criar "Pontos de Salvamento" e voltar no tempo caso o sistema quebre.

---

## 💾 1. Como CRIAR um novo Ponto de Salvamento (Backup)
Sempre que o sistema estiver **funcionando perfeitamente** e você for pedir para a Inteligência Artificial (ou você mesmo) criar algo novo e complexo, crie um backup antes.

Abra o terminal (na pasta do projeto `agendamento`) e digite:

```bash
git add .
git commit -m "seu comentario de o que esta funcionando agora"
```
*Exemplo: `git commit -m "login funcionando com as cores novas"`*

---

## ⏪ 2. Como RESTAURAR o sistema (Deu ruim, quero voltar!)
Se a Inteligência Artificial mudar muita coisa e o sistema quebrar, você pode voltar para a última "foto" salva.

### Opção A: Descartar TUDO que não foi salvo (Voltar para o último `commit`)
Se você ainda **não** deu `git commit`, mas os arquivos foram todos bagunçados, rode:

```bash
git restore .
```
*(Isso apaga todas as modificações atuais e volta os arquivos exatamente como estavam no último commit feito).*

### Opção B: Voltar para uma versão mais antiga específica
1. Primeiro, veja a lista de todos os seus backups com o comando:
```bash
git log --oneline
```
Você verá uma lista assim:
```text
a1b2c3d (HEAD -> master) login funcionando com as cores novas
9391d05 backup inicial 15-03-2026 16:38 sistema limpo e funcionando
```

2. Copie o códigozinho amarelo (ex: `9391d05`) da versão que você quer voltar.
3. Rode o comando:
```bash
git checkout 9391d05 .
```
*(Não esqueça do `.` no final)*

4. Depois, salve essa restauração como a nova versão atual:
```bash
git commit -m "restaurando para o backup inicial"
```

---

## 🪄 Dica de Ouro com a Inteligência Artificial (Antigravity)
Como o Git já está configurado, você sequer precisa digitar esses comandos se não quiser. 

Você pode simplesmente pedir para mim no chat:
> *"Crie um ponto de salvamento/backup da versão atual"*
ou 
> *"O sistema quebrou. Restaure o código para o último backup salvo que estava funcionando!"*

Eu rodarei esses comandos por você. 🚀
