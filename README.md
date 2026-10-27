# PinQuattrini

Web app (PWA) per tenere traccia del budget di coppia: spese, categorie con budget mensile, spese ricorrenti e avvisi di soglia. I dati sono sincronizzati in tempo reale tra i due dispositivi tramite Firebase (Firestore + Authentication).

L'app è installabile sulla schermata Home e, grazie al service worker, si apre anche con connessione assente o instabile (i dati salvati restano consultabili; la sincronizzazione riprende quando torna la rete).

## Come si pubblica (GitHub Pages)

Il sito è completamente statico, non serve nessuna build.

1. Vai in **Settings → Pages** del repository.
2. In *Build and deployment* scegli **Deploy from a branch**, branch `main`, cartella `/ (root)`.
3. Dopo qualche minuto l'app è disponibile su `https://<utente>.github.io/<repository>/`.

Tutti i percorsi sono relativi, quindi l'app funziona anche in una sottocartella.

Prova in locale:

```bash
python3 -m http.server 8000
# poi apri http://localhost:8000/
```

## File del progetto

| File | Descrizione |
| --- | --- |
| `index.html` | L'intera app (HTML, CSS e JavaScript in un unico file) |
| `sw.js` | Service worker: precache della shell e strategia stale-while-revalidate |
| `manifest.json` | Manifest PWA (nome, colori, icone) |
| `logo-192.png`, `logo-512.png` | Icone dell'app |
| `logo-maskable-512.png` | Icona maskable con zona di sicurezza |
| `logo-mono-512.png` | Icona monocromatica |
| `apple-touch-icon.png` | Icona per iOS |
| `favicon.svg`, `favicon-32.png` | Favicon |

## Service worker e aggiornamenti

`sw.js` mette in cache la shell dell'app, i moduli Firebase (`gstatic.com/firebasejs/10.12.2/`) e i font Google. Le chiamate a Firestore e Authentication non vengono intercettate e vanno sempre in rete.

Le risorse in cache vengono aggiornate in background a ogni visita. Se si modifica l'elenco dei file in precache, incrementare `VERSION` in `sw.js`: le vecchie cache vengono eliminate all'attivazione.

## Firebase

Le regole di sicurezza di Firestore **non sono nel repository**: vanno impostate dalla console Firebase (*Firestore Database → Regole*), limitando lettura e scrittura ai soli utenti autorizzati della coppia. Non committare nel repository identificativi o segreti legati agli utenti.
