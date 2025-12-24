import React from 'react';
import { Avatar } from '@natify/ui';
import { useProductListViewModel } from '../viewmodels/useProductListViewModel';

/**
 * Componente de acciones del header para ProductList
 * Usa el ViewModel para acceder a la acción goToProfile
 */
export const ProductListHeaderActions: React.FC = () => {
  const { actions } = useProductListViewModel();

  return <Avatar name="Usuario" size="md" onPress={actions.goToProfile} />;
};
