import React, { useEffect, useState } from "react";
import { Container, Paper, Typography, Stack, Button, List, ListItem, ListItemText, ListItemSecondaryAction, Divider, Alert } from "@mui/material";
import apiFetch from "../../utils/api";
import { formatPrice } from "../../utils/formatPrice";

const ProductDisable: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setError(null);
    try {
      const res = await apiFetch(`/api/products`);
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || "Error");
    }
  };

  useEffect(() => { load(); }, []);

  const disableProduct = async (id: number) => {
    if (!confirm("Confirmar deshabilitar producto?")) return;
    try {
      const res = await apiFetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      // refresh
      await load();
    } catch (err: any) {
      setError(err.message || "Error");
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Deshabilitar productos
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <List>
          {products.map((p) => (
            <React.Fragment key={p.id}>
              <ListItem>
                <ListItemText primary={p.name} secondary={`Precio: ${formatPrice(p.price)} — Categoría: ${p.category?.name || "-"}`} />
                <ListItemSecondaryAction>
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" color="error" onClick={() => disableProduct(p.id)}>
                      Deshabilitar
                    </Button>
                  </Stack>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default ProductDisable;
