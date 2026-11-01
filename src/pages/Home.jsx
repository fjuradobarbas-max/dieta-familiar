import menu from "../data/menu.json";
import weights from "../data/weights.json";
import shopping from "../data/shopping.json";

function Home() {
  const dias = [
    "domingo",
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
  ];

  const dia = dias[new Date().getDay()];

  const menuDia = menu[dia];

  const fernandoActual =
    weights.fernando.pesajes[
      weights.fernando.pesajes.length - 1
    ].peso;

  const deboraActual =
    weights.debora.pesajes[
      weights.debora.pesajes.length - 1
    ].peso;

  const progresoFernando =
    ((weights.fernando.pesoInicial -
      fernandoActual) /
      (weights.fernando.pesoInicial -
        weights.fernando.pesoObjetivo)) *
    100;

  const progresoDebora =
    ((weights.debora.pesoInicial -
      deboraActual) /
      (weights.debora.pesoInicial -
        weights.debora.pesoObjetivo)) *
    100;

  const contarPendientes = (casa) => {
    let total = 0;

    Object.values(shopping[casa]).forEach(
      (categoria) => {
        total += categoria.length;
      }
    );

    return total;
  };

  return (
    <div>
      <h1 className="page-title">
        📅 {dia.toUpperCase()}
      </h1>

      <div className="card">
        <h2>👨 Fernando</h2>

        <div className="metric">
          {fernandoActual} kg
        </div>

        <div className="metric-small">
          Objetivo: {weights.fernando.pesoObjetivo} kg
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${Math.max(
                0,
                Math.min(
                  100,
                  progresoFernando
                )
              )}%`,
            }}
          />
        </div>
      </div>

      <div className="card">
        <h2>👩 Débora</h2>

        <div className="metric">
          {deboraActual} kg
        </div>

        <div className="metric-small">
          Objetivo: {weights.debora.pesoObjetivo} kg
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${Math.max(
                0,
                Math.min(
                  100,
                  progresoDebora
                )
              )}%`,
            }}
          />
        </div>
      </div>

      <div className="card">
        <h2>🍳 Desayuno</h2>

        <p>
          <strong>Fernando</strong>
          <br />
          {menuDia.fernando.desayuno}
        </p>

        <br />

        <p>
          <strong>Débora</strong>
          <br />
          {menuDia.debora.desayuno}
        </p>
      </div>

      <div className="card">
        <h2>🍎 Almuerzo</h2>

        <p>
          <strong>Fernando</strong>
          <br />
          {menuDia.fernando.almuerzo}
        </p>

        <br />

        <p>
          <strong>Débora</strong>
          <br />
          {menuDia.debora.almuerzo}
        </p>
      </div>

      <div className="card">
        <h2>🍽️ Comida</h2>

        <p>
          <strong>Fernando</strong>
          <br />
          {menuDia.fernando.comida}
        </p>

        <br />

        <p>
          <strong>Débora</strong>
          <br />
          {menuDia.debora.comida}
        </p>
      </div>

      <div className="card">
        <h2>🥜 Merienda</h2>

        <p>
          <strong>Fernando</strong>
          <br />
          {menuDia.fernando.merienda}
        </p>

        <br />

        <p>
          <strong>Débora</strong>
          <br />
          {menuDia.debora.merienda}
        </p>
      </div>

      <div className="card">
        <h2>🌙 Cena</h2>

        <p>
          <strong>Fernando</strong>
          <br />
          {menuDia.fernando.cena}
        </p>

        <br />

        <p>
          <strong>Débora</strong>
          <br />
          {menuDia.debora.cena}
        </p>
      </div>

      <div className="card">
        <h2>🛒 Compra pendiente</h2>

        <p>
          🏠 Guadalajara:{" "}
          {contarPendientes(
            "guadalajara"
          )}{" "}
          productos
        </p>


        <p>
          🏠 Murillo:{" "}
          {contarPendientes(
            "murillo"
          )}{" "}
          productos
        </p>
      </div>
    </div>
  );
}

export default Home;