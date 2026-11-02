import { useState } from "react";
import shopping from "../data/shopping.json";
import { db } from "../services/firebase";
import { useEffect } from "react";

import {
  getProductos
} from "../services/shoppingService";

console.log("Firebase conectado:", db);

function Shopping() {
  const [casa, setCasa] = useState("guadalajara");
  const [comprados, setComprados] = useState({});

  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [categoria, setCategoria] = useState("otros");

  const [productos, setProductos] = useState(shopping);

  const [firebaseProductos, setFirebaseProductos] =
  useState([]);

  const datos = productos[casa];
  useEffect(() => {
    const cargarProductos = async () => {
      const lista = await getProductos(casa);
  
      console.log(
        "Productos Firebase:",
        lista
      );
  
      setFirebaseProductos(lista);
    };
  
    cargarProductos();
  }, [casa]);

  const toggleComprado = (id) => {
    setComprados((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const agregarProducto = () => {
    if (!nombre.trim() || !cantidad.trim()) return;

    setProductos((prev) => ({
      ...prev,
      [casa]: {
        ...prev[casa],
        [categoria]: [
          ...(prev[casa][categoria] || []),
          {
            nombre,
            cantidad,
          },
        ],
      },
    }));

    setNombre("");
    setCantidad("");
  };

  const eliminarProducto = (categoria, index) => {
    setProductos((prev) => ({
      ...prev,
      [casa]: {
        ...prev[casa],
        [categoria]: prev[casa][categoria].filter(
          (_, i) => i !== index
        ),
      },
    }));
  };

  return (
    <div>
      <h1 className="page-title">
        🛒 Lista de Compra
      </h1>

      <div className="card">
        <h2>🏠 Selecciona Casa</h2>

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "15px",
          }}
        >
          <button
            className={`day-button ${
              casa === "guadalajara"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setCasa("guadalajara")
            }
          >
            Guadalajara
          </button>

          <button
            className={`day-button ${
              casa === "murillo"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setCasa("murillo")
            }
          >
            Murillo
          </button>
        </div>
      </div>

      <div className="card">
        <h2>➕ Añadir Producto</h2>

        <input
          type="text"
          placeholder="Producto"
          value={nombre}
          onChange={(e) =>
            setNombre(e.target.value)
          }
          className="form-input"
        />

        <input
          type="text"
          placeholder="Cantidad"
          value={cantidad}
          onChange={(e) =>
            setCantidad(e.target.value)
          }
          className="form-input"
        />

        <select
          value={categoria}
          onChange={(e) =>
            setCategoria(e.target.value)
          }
          className="form-input"
        >
          <option value="carne">
            🥩 Carne
          </option>

          <option value="pescado">
            🐟 Pescado
          </option>

          <option value="pasta">
            🍝 Pasta y legumbres
          </option>

          <option value="verduras">
            🥬 Verduras
          </option>

          <option value="fruta">
            🍎 Fruta
          </option>

          <option value="lacteos">
            🥛 Lácteos y desayunos
          </option>

          <option value="limpieza">
            🧻 Limpieza e higiene
          </option>

          <option value="hogar">
            🏠 Hogar
          </option>

          <option value="otros">
            📦 Otros
          </option>
        </select>

        <button
          className="primary-button"
          onClick={agregarProducto}
        >
          Añadir Producto
        </button>
      </div>

      {Object.entries(datos).map(
        ([categoria, listaProductos]) => (
          <div
            key={categoria}
            className="card"
          >
            <h2>
              {categoria.toUpperCase()}
            </h2>

            {listaProductos.map(
              (producto, index) => {
                const id = `${casa}-${categoria}-${index}`;

                return (
                  <div
                    key={id}
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                             borderBottom:
                        "1px solid #eee",
                    }}
                  >
                    <div
                      onClick={() =>
                        toggleComprado(id)
                      }
                      style={{
                        cursor:
                          "pointer",
                        flex: 1,
                      }}
                    >
                      <strong>
                        {comprados[id]
                          ? "✅"
                          : "⬜"}
                      </strong>{" "}
                      {producto.nombre}

                      <div
                        style={{
                          color:
                            "#64748b",
                          fontSize:
                            "14px",
                        }}
                      >
                        {
                          producto.cantidad
                        }
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        eliminarProducto(
                          categoria,
                          index
                        )
                      }
                      style={{
                        background:
                          "#ef4444",
                        color:
                          "white",
                        border:
                          "none",
                        borderRadius:
                          "10px",
                        padding:
                          "8px 12px",
                        cursor:
                          "pointer",
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                );
              }
            )}
          </div>
        )
      )}
    </div>
  );
}

export default Shopping;