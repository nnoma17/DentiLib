const mongoUsers = await db.collection('users').find().toArray();

for (const u of mongoUsers) {
  await Utilisateur.create({
    nom: u.nom,
    prenom: u.prenom,
    email: u.email,
    password: u.password,
    role: u.role
  });
}