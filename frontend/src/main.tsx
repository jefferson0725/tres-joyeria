import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { HelmetProvider } from "react-helmet-async";

const theme = createTheme({
	palette: { mode: "light", primary: { main: "#1976d2" } },
});

createRoot(document.getElementById("root")!).render(
	<HelmetProvider>
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<App />
		</ThemeProvider>
	</HelmetProvider>
);
