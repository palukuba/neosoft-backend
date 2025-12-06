Analyse le projet, corrige-le et mets à jour toutes les parties nécessaires, y compris les trois applications UI et la structure de la base de données Supabase.

Le projet est une plateforme d’émission et de vérification de documents scolaires, académiques et de formation. Les trois applications partagent les mêmes composants. La plateforme utilise Cardano pour l’ancrage blockchain et Supabase pour toute la partie Web2.

Exigences :

1. Gérer toute la logique Web2 avec Supabase : authentification, stockage, KYC, base de données, gestion des rôles et règles d’accès.


2. Toutes les applications doivent utiliser l’authentification Google.


3. Chaque école doit être vérifiée avant d’obtenir le droit d’émettre un document.


4. La page KYC doit inclure la vérification obligatoire de l’adresse email de l’école.


5. Chaque école doit recevoir un identifiant unique sur 4 caractères en base 36 (0–9, A–Z).


6. Chaque document émis doit recevoir un identifiant unique sur 8 caractères en base 36.


7. L’identifiant complet d’un document doit respecter le format :
CD-UN-000E-02032024-0000A00
Structure :

Indicatif du pays

Type d’institut : UN, IS, LC, CF

Identifiant de l’école (4 caractères base36)

Date d’émission

Identifiant du document (8 caractères base36)



8. Dans l’application d’émission, supprimer toutes les métadonnées inutiles.


9. Chaque document doit contenir uniquement son numéro unique et sa date d’émission.


10. Chaque école doit pouvoir gérer ses étudiants :

ajout manuel d’un étudiant un par un

import d’un fichier CSV ou Excel pour ajouter plusieurs étudiants

mise à jour et suppression autorisées uniquement pour l’école propriétaire



11. Mettre à jour toutes les applications UI pour :

intégrer le flux KYC complet

restreindre l’accès à l’émission aux écoles validées

intégrer la gestion des étudiants (manuel + CSV/Excel)

appliquer le format d’identifiant défini

retirer toutes les métadonnées non autorisées

synchroniser les composants partagés



12. Réfléchir à la structure complète de la base de données Supabase afin d’assurer :

unicité des identifiants

séparation stricte des données par école

cohérence des documents émis

sécurité, rôles, RLS, relations

stockage optimal des documents et fichiers importés.
