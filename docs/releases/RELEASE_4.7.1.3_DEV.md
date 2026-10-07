# Utilitários Municipais v4.7.1.3 DEV

## Correção

A troca de módulo alterava `activeTab`, `lastToolTab` e `recentTools`. Como essas chaves faziam parte do grupo sincronizado `navigation`, uma simples navegação podia ser interpretada como alteração local concorrente com o estado remoto e abrir o modal de conflito.

Nesta versão, o estado de navegação passa a ser exclusivamente local. Ele não representa dado do usuário que necessite sincronização entre dispositivos.

Os demais grupos de dados e preferências continuam sincronizados normalmente. Não há SQL novo.
