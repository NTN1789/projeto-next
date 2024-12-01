

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, Typography, IconButton, Menu, MenuItem, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle,
  TableFooter, Alert
} from '@mui/material';

import  Pagination from "@mui/material/Pagination";

import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';


interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  creationDate: string;
  lastLogin: string;
}

const UserTable: React.FC = () => {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const rowsPerPage = 7;
  const [pagination, setPagination] = React.useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  })
  const [users, setUsers] = useState<User[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({
    key: 'name',
    direction: 'asc',
  });

  const apiUrlBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

  useEffect(() => {
    const fetchUsers = async (page = 1) => {
      try {
        const response = await fetch(`${apiUrlBase}/usuarios?page=${page}`);
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
          setPagination({
            currentPage: data.current_page,
            totalPages: data.last_page,
            totalItems: data.total,
          });
        } else {
          console.error('Erro ao buscar os usuários:', response.status);
        }
      } catch (error) {
        console.error('Erro ao conectar com a API:', error);
      }
    };
    fetchUsers(page);
  }, [page]);

  const sortedUsers = React.useMemo(() => {
    if (!sortConfig) return users;

    return [...users].sort((a, b) => {
      const aValue = sortConfig.key === 'name' ? a.name.toLowerCase() : new Date(a.creationDate).getTime();
      const bValue = sortConfig.key === 'name' ? b.name.toLowerCase() : new Date(b.creationDate).getTime();

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((prevConfig) => {
      if (prevConfig.key === key) {
        return { key, direction: prevConfig.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };


  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage); 
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, userId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedUserId(userId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    if (selectedUserId !== null) {
      router.push(`/editar-usuario/${selectedUserId}`);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
    handleMenuClose();
  };

  const handleConfirmDelete = async () => {
    if (selectedUserId !== null) {
      try {
        await fetch(`${apiUrlBase}/excluir-user/${selectedUserId}`, { method: 'DELETE' });
        setUsers(users.filter(user => user.id !== selectedUserId));
      } catch (error) {
        console.error('Erro ao deletar usuário:', error);
      }
    }
    setOpenDeleteDialog(false);
  };

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom color="primary" sx={{ padding: 2 }}>
        Usuários
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        sx={{ marginBottom: 2, display: 'flex', justifyContent: 'end', marginLeft: '90%' }}
        onClick={() => router.push('/novo-usuario')}
      >
        Novo usuário
      </Button>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table"  >
          <TableHead >
            <TableRow  >
              <TableCell onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                Usuário
                {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
              </TableCell>
              <TableCell>E-mail</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell onClick={() => handleSort('creationDate')} style={{ cursor: 'pointer' }}>
                Data de criação
                {sortConfig.key === 'creationDate' && (sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
              </TableCell>
              <TableCell>Último login</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
              <TableRow  key={user.id}>
                <TableCell  >{user.name}</TableCell>
                <TableCell  >{user.email}</TableCell>
                <TableCell   >{user.phone}</TableCell>
                <TableCell   >{user.creationDate}</TableCell>
                <TableCell   >{user.lastLogin || '-'}</TableCell>
                <TableCell>
                  <IconButton onClick={(e) => handleMenuClick(e, user.id)}>
                    <MoreVertIcon />
                  </IconButton>
                  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                    <MenuItem onClick={handleEditClick}>
                      <EditIcon fontSize="small" />
                      Editar
                    </MenuItem>
                    <MenuItem onClick={handleDeleteClick}>
                      <DeleteIcon fontSize="small" />
                      Deletar
                    </MenuItem>
                  </Menu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell  colSpan={6} align="left">
                <Typography style={{ display: "flex", alignItems: "center" }} variant="subtitle1">
                  Total: {users.length}
                </Typography>     
    

              
                <Pagination
                  variant="outlined"
                  style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}
                  showFirstButton
                  showLastButton
                  count={pagination.totalPages}
                  page={page}
                  onChange={handleChangePage} 
                />
                
                
</TableCell>
</TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Alert severity="warning">Atenção</Alert>
            Você deseja excluir este usuário? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default UserTable;
