# Juego Par e Impar (Odd & Even Game)

Un juego de estrategia matemática donde los jugadores colocan números pares e impares en un tablero 3x3 para sumar 15 en línea.

## 🎮 Características

- **Múltiples modos de juego**: vs CPU, vs Jugador, Online
- **Sistema de rondas**: Juega de 1 a 9 rondas
- **Multilingüe**: Español e Inglés
- **Interfaz moderna**: Diseño responsive y atractivo
- **Estadísticas**: Seguimiento de victorias por jugador

## 🚀 Cómo jugar

1. **Registra tu nombre** o el de los jugadores
2. **Selecciona el modo de juego**:
   - vs Dispositivo: Juega contra la CPU
   - vs Jugador: Juega contra otro jugador
   - Online: Juega en línea (requiere servidor)
3. **Elige el número de rondas** (1, 3, 5, 7, o 9)
4. **Coloca números en el tablero** para sumar 15 en línea

## 📋 Reglas del juego

- **Impar siempre empieza**
- Los números impares (1, 3, 5, 7, 9) van en un color
- Los números pares (2, 4, 6, 8) van en otro color
- **Gana quien logre sumar 15** en una línea horizontal, vertical o diagonal
- Cada número solo puede usarse una vez por jugador
- Si el tablero se llena sin ganador, es empate

## 🛠️ Tecnologías utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express (para modo online)
- **Estilos**: CSS Grid, Flexbox, Animaciones CSS
- **Arquitectura**: Módulos ES6, Programación funcional

## 📁 Estructura del proyecto

```
par_impar/
├── public/           # Archivos estáticos
│   ├── index.html    # Página principal
│   ├── style.css     # Estilos
│   └── images/       # Imágenes
├── src/              # Código fuente
│   ├── app.js        # Aplicación principal
│   ├── game.js       # Lógica del juego
│   ├── ui.js         # Interfaz de usuario
│   └── lang/         # Archivos de idioma
│       ├── es.json   # Español
│       └── en.json   # Inglés
├── server/           # Servidor backend
│   ├── server.js     # Servidor Express
│   └── data.json     # Datos persistentes
└── package.json      # Dependencias
```

## 🌐 Demo en vivo

[Jugar ahora](https://tu-usuario.github.io/par-impar)

## 🚀 Instalación local

1. **Clona el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/par-impar.git
   cd par-impar
   ```

2. **Instala las dependencias**:
   ```bash
   npm install
   ```

3. **Ejecuta el servidor de desarrollo**:
   ```bash
   npm start
   ```

4. **Abre tu navegador** en `http://localhost:3000`

## 📱 Compatibilidad

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Móviles (responsive)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Tu Nombre**
- GitHub: [@tu-usuario](https://github.com/tu-usuario)

## 🙏 Agradecimientos

- Inspirado en juegos de estrategia matemática
- Diseño inspirado en interfaces modernas
- Agradecimientos a la comunidad de desarrolladores

---

⭐ Si te gustó este proyecto, ¡dale una estrella en GitHub!