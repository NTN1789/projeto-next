import React from 'react';
import { useRouter } from 'next/router';
import UserForm from '../../../components/UserForm';

const EditarUsuarioPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  if (!id || typeof id !== 'string') {
    return <p>Carregando...</p>;
  }

  return <UserForm userId={id} />;
};

export default EditarUsuarioPage;
