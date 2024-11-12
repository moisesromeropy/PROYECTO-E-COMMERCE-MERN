// I. Importaciones necesarias
import React, { useContext, useEffect, useState } from 'react';
import { editData, fetchDataFromApi } from '../../utils/api';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Pagination from '@mui/material/Pagination';
import Dialog from '@mui/material/Dialog';
import { MdClose } from "react-icons/md";
import Button from '@mui/material/Button';

// II. Definición del componente StyledBreadcrumb para los breadcrumbs personalizados
const StyledBreadcrumb = styled(Chip)(({ theme }) => {
    const backgroundColor =
        theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[800];
    return {
        backgroundColor,
        height: theme.spacing(3),
        color: theme.palette.text.primary,
        fontWeight: theme.typography.fontWeightRegular,
        '&:hover, &:focus': {
            backgroundColor: emphasize(backgroundColor, 0.06),
        },
        '&:active': {
            boxShadow: theme.shadows[1],
            backgroundColor: emphasize(backgroundColor, 0.12),
        },
    };
});

// III. Definición del componente Orders
const Orders = () => {
    // IV. Definición de los estados
    const [orders, setOrders] = useState([]); // Estado para almacenar las órdenes
    const [page, setPage] = useState(1); // Estado para manejar la paginación
    const [products, setProducts] = useState([]); // Estado para almacenar los productos de una orden específica
    const [isOpenModal, setIsOpenModal] = useState(false); // Estado para controlar la apertura del modal
    const [singleOrder, setSingleOrder] = useState(); // Estado para almacenar una orden individual
    const [totalOrders, setTotalOrders] = useState(0); // Estado para el total de órdenes

    const perPage = 8; // Número de órdenes por página

    // V. Efecto para cargar las órdenes al montar el componente
    useEffect(() => {
        window.scrollTo(0, 0); // Desplaza la ventana hacia arriba al cargar la página
        fetchDataFromApi(`/api/orders?page=${page}&perPage=${perPage}`).then((res) => {
            setOrders(res.orders); // Almacena las órdenes en el estado
            setTotalOrders(res.total); // Almacena el total de órdenes
        });
    }, [page]);

    // VI. Función para mostrar los productos de una orden en un modal
    const showProducts = (id) => {
        fetchDataFromApi(`/api/orders/${id}`).then((res) => {
            setIsOpenModal(true); // Abre el modal
            setProducts(res.products); // Almacena los productos de la orden en el estado
        });
    };

    // VII. Función para actualizar el estado de una orden
    const orderStatus = (orderStatus, id) => {
        fetchDataFromApi(`/api/orders/${id}`).then((res) => {
            const order = {
                name: res.name,
                phoneNumber: res.phoneNumber,
                address: res.address,
                pincode: res.pincode,
                amount: parseInt(res.amount),
                paymentId: res.paymentId,
                email: res.email,
                userid: res.userId,
                products: res.products,
                status: orderStatus // Actualiza el estado de la orden
            };

            editData(`/api/orders/${id}`, order).then(() => {
                fetchDataFromApi(`/api/orders?page=${1}&perPage=${perPage}`).then((res) => {
                    setOrders(res.orders); // Actualiza las órdenes en el estado
                    window.scrollTo({
                        top: 200,
                        behavior: 'smooth',
                    });
                });
            });

            setSingleOrder(res.products); // Almacena la orden individual en el estado
        });
    };

    // VIII. Función para manejar el cambio de página
    const handlePageChange = (event, value) => {
        setPage(value);
    };

    // IX. Renderización del componente
    return (
        <>
            <div className="right-content w-100">
                <div className="card shadow border-0 w-100 flex-row p-4 align-items-center">
                    <h5 className="mb-0">Lista de Órdenes</h5>
                    <div className="ml-auto d-flex align-items-center">
                        <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
                            <StyledBreadcrumb
                                component="a"
                                href="#"
                                label="Dashboard"
                                icon={<HomeIcon fontSize="small" />}
                            />
                            <StyledBreadcrumb
                                label="Órdenes"
                                deleteIcon={<ExpandMoreIcon />}
                            />
                        </Breadcrumbs>
                    </div>
                </div>

                {/* IX. Tabla de órdenes */}
                <div className="card shadow border-0 p-3 mt-4">
                    <div className="table-responsive mt-3">
                        <table className="table table-bordered table-striped v-align">
                            <thead className="thead-dark">
                                <tr>
                                    <th>Id de Pago</th>
                                    <th>Productos</th>
                                    <th>Nombre</th>
                                    <th>Número de Teléfono</th>
                                    <th>Dirección</th>
                                    <th>Código Postal</th>
                                    <th>Monto Total</th>
                                    <th>Email</th>
                                    <th>Id de Usuario</th>
                                    <th>Estado del Pedido</th>
                                    <th>Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                            {orders && orders.length > 0 && orders.map((order, index) => (
                                <tr key={index}>
                                    <td><span className='text-blue font-weight-bold'>{order.paymentId}</span></td>
                                    <td><span className='text-blue font-weight-bold cursor' onClick={() => showProducts(order._id)}>Click aquí para visualizar</span></td>
                                    <td>{order.name}</td>
                                    <td>{order.phoneNumber}</td>
                                    <td>{order.address}</td>
                                    <td>{order.pincode}</td>
                                    <td>{order.amount}</td>
                                    <td>{order.email}</td>
                                    <td>{order.userid}</td>
                                    <td>
                                        {order.status === "pending" ? (
                                            <span className='badge badge-danger cursor' onClick={() => orderStatus("confirm", order._id)}>{order.status}</span>
                                        ) : (
                                            <span className='badge badge-success cursor' onClick={() => orderStatus("pending", order._id)}>{order.status}</span>
                                        )}
                                    </td>
                                    <td>{order.date}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Paginación */}
                    <Pagination
                        count={Math.ceil(totalOrders / perPage)}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        className="mt-3"
                    />
                </div>
            </div>

            {/* X. Modal para mostrar productos de una orden */}
            <Dialog open={isOpenModal} className="productModal">
                <Button className='close_' onClick={() => setIsOpenModal(false)}><MdClose /></Button>
                <h4 className="mb-1 font-weight-bold pr-5 mb-4">Productos</h4>
                <div className='table-responsive orderTable'>
                    <table className='table table-striped table-bordered'>
                        <thead className='thead-dark'>
                            <tr>
                                <th>ID del producto</th>
                                <th>Nombre del Producto</th>
                                <th>Imagen</th>
                                <th>Cantidad</th>
                                <th>Precio</th>
                                <th>SubTotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length !== 0 && products.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.productId}</td>
                                    <td style={{ whiteSpace: "inherit" }}>{item.productTitle?.substr(0, 30) + '...'}</td>
                                    <td>
                                        <div className='img'>
                                            <img src={item.image} alt="Producto" />
                                        </div>
                                    </td>
                                    <td>{item.quantity}</td>
                                    <td>{item.price}</td>
                                    <td>{item.subTotal}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Dialog>
        </>
    );
};

// IX. Exportacion del componente
export default Orders;