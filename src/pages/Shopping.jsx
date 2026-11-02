import { useState, useEffect } from "react";

import {
  getProductos,
  addProducto,
  deleteProducto,
  subscribeProductos,
  updateComprado,
} from "../services/shoppingService";

function Shopping() {
  const [casa, setCasa] = useState("guadalajara");

  const [firebaseProductos, setFirebaseProductos] =
    useState([]);

  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [categoria, setCategoria] = useState("otros");

  useEffect(() => {
    const unsubscribe =
      subscribeProductos(
        casa,
        setFirebaseProductos
      );

    return () => unsubscribe();
  }, [casa]);

  const agregarProducto = async () => {
    if (!nombre.trim() || !cantidad.trim()) {
      return;
    }

    await addProducto(casa, {
      nombre,
      cantidad,
      categoria,
      comprado: false,
    });

    setNombre("");
    setCantidad("");
  };

  const eliminarProductoFirebase =
    async (id) => {
      await deleteProducto(casa, id);
    };

  const toggleCompradoFirebase =
    async (producto) => {
      await updateComprado(
        casa,
        producto.id,
        !producto.comprado
      );
    };

  const categoriasOrdenadas = [
    "carne",
    "pescado",
    "pasta",
    "verduras",
    "fruta",
    "lacteos",
    "limpieza",
    "hogar",
    "otros",
  ];

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

      {categoriasOrdenadas.map(
        (categoriaActual) => {
          const productosCategoria =
            firebaseProductos.filter(
              (producto) =>
                producto.categoria ===
                categoriaActual
            );

          if (
            productosCategoria.length === 0
          ) {
            return null;
          }

          return (
            <div
              key={categoriaActual}
              className="card"
            >
              <h2>
                {categoriaActual.toUpperCase()}
              </h2>

              {productosCategoria.map(
                (producto) => (
                  <div
                    key={producto.id}
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      borderBottom:
                        "1px solid #eee",
                      padding: "10px 0",
                    }}
                  >
                    <div
                      onClick={() =>
                        toggleCompradoFirebase(
                          producto
                        )
                      }
                      style={{
                        cursor: "pointer",
                        flex: 1,
                      }}
                    >
                      <strong>
                        {producto.comprado
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
                        eliminarProductoFirebase(
                          producto.id
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
                )
              )}
            </div>
          );
        }
      )}
    </div>
  );
}

export default Shopping;