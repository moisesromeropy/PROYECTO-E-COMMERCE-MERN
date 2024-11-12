// I. Importaciones necesarias
import React, { useContext, useEffect, useRef, useState } from 'react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { emphasize, styled } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Rating from '@mui/material/Rating';
import { FaCloudUploadAlt, FaRegImages } from "react-icons/fa";
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { IoCloseSharp } from "react-icons/io5";
import { useNavigate, useParams } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { deleteData, deleteImages, editData, fetchDataFromApi, postData, uploadImage } from '../../utils/api';
import { MyContext } from '../../App';
import CountryDropdown from '../../components/CountryDropdown/CountryDropdown';

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

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

// III. Definición del componente EditUpload
const EditUpload = () => {
    // IV. Definición de estados
    const [categoryVal, setCategoryVal] = useState('');
    const [subCatVal, setSubCatVal] = useState('');
    const [productRams, setProductRAMS] = useState([]);
    const [productWeight, setProductWeight] = useState([]);
    const [productSize, setProductSize] = useState([]);
    const [productRAMSData, setProductRAMSData] = useState([]);
    const [productWEIGHTData, setProductWEIGHTData] = useState([]);
    const [productSIZEData, setProductSIZEData] = useState([]);
    const [ratingsValue, setRatingValue] = useState(1);
    const [isFeaturedValue, setIsFeaturedValue] = useState('');
    const [catData, setCatData] = useState([]);
    const [subCatData, setSubCatData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [product, setProduct] = useState([]);
    const [previews, setPreviews] = useState([]);
    const { id } = useParams();
    const navigate = useNavigate();
    const [formFields, setFormFields] = useState({
        name: '',
        subCat: '',
        description: '',
        brand: '',
        price: null,
        oldPrice: null,
        catName: '',
        catId: '',
        subCatId: '',
        category: '',
        countInStock: null,
        rating: 0,
        isFeatured: null,
        discount: 0,
        productRam: [],
        size: [],
        productWeight: [],
        location: ""
    });

    const productImages = useRef();
    const context = useContext(MyContext);
    const formdata = new FormData();

    // V. Efecto para cargar datos iniciales
    useEffect(() => {
        
        const subCatArr=[];

        context.catData?.categoryList?.length !== 0 && context.catData?.categoryList?.map((cat, index) => {
                if(cat?.children.length!==0){
                    cat?.children?.map((subCat)=>{
                        subCatArr.push(subCat);
                    })
                }
        });

        setSubCatData(subCatArr);
    }, [context.catData]);

    useEffect(() => {
        window.scrollTo(0, 0);
        context.setselectedCountry("");
        

      

        fetchDataFromApi(`/api/products/${id}`).then((res) => {
            console.log(res)
            setProduct(res);
            setFormFields({
                name: res.name,
                description: res.description,
                brand: res.brand,
                price: res.price,
                oldPrice: res.oldPrice,
                catName: res.catName,
                category: res.category,
                catId: res.catId,
                subCat: res.subCat,
                countInStock: res.countInStock,
                rating: res.rating,
                isFeatured: res.isFeatured,
                discount: res.discount,
                productRam: res.productRam,
                size: res.size,
                productWeight: res.productWeight,
                location: res.location
            });
            context.setselectedCountry(res.location);
            setRatingValue(res.rating);
            setCategoryVal(res.category?._id);
            setSubCatVal(res.subCatId);
            setIsFeaturedValue(res.isFeatured);
            setProductRAMS(res.productRam);
            setProductSize(res.size);
            setProductWeight(res.productWeight);
            setPreviews(res.images);
            context.setProgress(100);
        });

        fetchDataFromApi("/api/productWeight").then((res) => {
            setProductWEIGHTData(res);
        });
        fetchDataFromApi("/api/productRAMS").then((res) => {
            setProductRAMSData(res);
        });
        fetchDataFromApi("/api/productSIZE").then((res) => {
            setProductSIZEData(res);
        });
    }, []);

    // VI. Manejar cambios en los campos del formulario
    const handleChangeCategory = (event) => {
      
        setCategoryVal(event.target.value);
        setFormFields(() => ({
            ...formFields,
            category: event.target.value
        }))
    };


    const handleChangeSubCategory = (event) => {
        setSubCatVal(event.target.value);
    };


    const handleChangeisFeaturedValue = (event) => {
        setIsFeaturedValue(event.target.value);
        setFormFields(() => ({
            ...formFields,
            isFeatured: event.target.value
        }));
    };

    const handleChangeProductRams = (event) => {
        const { target: { value } } = event;
        setProductRAMS(typeof value === 'string' ? value.split(',') : value);
        formFields.productRam = value;
    };

    const handleChangeProductWeight = (event) => {
        const { target: { value } } = event;
        setProductWeight(typeof value === 'string' ? value.split(',') : value);
        formFields.productWeight = value;
    };

    const handleChangeProductSize = (event) => {
        const { target: { value } } = event;
        setProductSize(typeof value === 'string' ? value.split(',') : value);
        formFields.size = value;
    };

    const inputChange = (e) => {
        setFormFields({ ...formFields, [e.target.name]: e.target.value });
    };

    const selectCat = (cat, id) => {
        formFields.catName = cat;
        formFields.catId = id;
    };

    const selectSubCat=(subCat, id)=>{
        setFormFields(() => ({
            ...formFields,
            subCat: subCat,
            subCatId:id
        }))

    }


    const edit_Product = (e) => {
        e.preventDefault();


   

        formdata.append('name', formFields.name);
        formdata.append('images', formFields.images);
        formdata.append('description', formFields.description);
        formdata.append('brand', formFields.brand);
        formdata.append('price', formFields.price);
        formdata.append('oldPrice', formFields.oldPrice);
        formdata.append('subCatId', formFields.subCatId);
        formdata.append('catId', formFields.catId);
        formdata.append('catName', formFields.catName);
        formdata.append('category', formFields.category);
        formdata.append('subCat', formFields.subCat);
        formdata.append('countInStock', formFields.countInStock);
        formdata.append('rating', formFields.rating);
        formdata.append('isFeatured', formFields.isFeatured);
        formdata.append('discount', formFields.discount);
        formdata.append('productRam', formFields.productRam);
        formdata.append('size', formFields.size);
        formdata.append('productWeight', formFields.productWeight);
        formdata.append('location', formFields.location);
        


        console.log(formFields)


        if (formFields.name === "") {
            context.setAlertBox({
                open: true,
                msg: 'please add product name',
                error: true
            })
            return false;
        }

        if (formFields.images === "") {
            context.setAlertBox({
                open: true,
                msg: 'please add product name',
                error: true
            })
            return false;
        }



        if (formFields.description === "") {
            context.setAlertBox({
                open: true,
                msg: 'please add product description',
                error: true
            });
            return false;
        }

        if (formFields.brand === "") {
            context.setAlertBox({
                open: true,
                msg: 'please add product brand',
                error: true
            });
            return false;
        }

        if (formFields.price === null) {
            context.setAlertBox({
                open: true,
                msg: 'please add product price',
                error: true
            });
            return false;
        }

        if (formFields.oldPrice === null) {
            context.setAlertBox({
                open: true,
                msg: 'please add product oldPrice',
                error: true
            });
            return false;
        }

        if (formFields.category === "") {
            context.setAlertBox({
                open: true,
                msg: 'please select a category',
                error: true
            });
            return false;
        }

        // if (formFields.subCat === "") {
        //     context.setAlertBox({
        //         open: true,
        //         msg: 'please select sub category',
        //         error: true
        //     })
        //     return false;
        // }

        if (formFields.countInStock === null) {
            context.setAlertBox({
                open: true,
                msg: 'please add product count in stock',
                error: true
            });
            return false;
        }

        if (formFields.rating === 0) {
            context.setAlertBox({
                open: true,
                msg: 'please select product rating',
                error: true
            });
            return false;
        }

        if (formFields.isFeatured === null) {
            context.setAlertBox({
                open: true,
                msg: 'please select the product is a featured or not',
                error: true
            });
            return false;
        }

        if (formFields.discount === null) {
            context.setAlertBox({
                open: true,
                msg: 'please select the product discount',
                error: true
            });
            return false;
        }



        setIsLoading(true);

        editData(`/api/products/${id}`, formFields).then((res) => {
            context.setAlertBox({
                open: true,
                msg: 'The product is created!',
                error: false
            });

            setIsLoading(false);

            navigate('/products');


        })

    };

    // VII. Renderización del componente
    return (
        <>
            <div className="right-content w-100">
                <div className="card shadow border-0 w-100 flex-row p-4">
                    <h5 className="mb-0">Editar producto</h5>
                    <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
                        <StyledBreadcrumb
                            component="a"
                            href="#"
                            label="Dashboard"
                            icon={<HomeIcon fontSize="small" />}
                            onClick={() => navigate('/dashboard')}
                        />
                        <StyledBreadcrumb
                            component="a"
                            label="Products"
                            href="#"
                            deleteIcon={<ExpandMoreIcon />}
                            onClick={() => navigate('/products')}
                        />
                        <StyledBreadcrumb
                            label="Product Edit"
                            deleteIcon={<ExpandMoreIcon />}
                        />
                    </Breadcrumbs>
                </div>

                <form className='form' onSubmit={edit_Product}>
                    <div className='row'>
                        <div className='col-md-12'>
                            <div className='card p-4 mt-0'>
                                <h5 className='mb-4'>Información Básica</h5>
                                <div className='form-group'>
                                    <h6>Nombre del Producto</h6>
                                    <input type='text' name="name" value={formFields.name} onChange={inputChange} />
                                </div>
                                <div className='form-group'>
                                    <h6>URL de imagenes</h6>
                                    <textarea rows={5} cols={10} value={formFields.images} name="images" onChange={inputChange} />
                                </div>
                                
                                <div className='form-group'>
                                    <h6>Descripción</h6>
                                    <textarea rows={5} cols={10} value={formFields.description} name="description" onChange={inputChange} />
                                </div>

                                <div className='row'>
                                    <div className='col'>
                                        <div className='form-group'>
                                            <h6>CATEGORIA</h6>
                                            <Select
                                                value={categoryVal}
                                                onChange={handleChangeCategory}
                                                displayEmpty
                                                inputProps={{ 'aria-label': 'Without label' }}
                                                className='w-100'
                                            >
                                                <MenuItem value="">
                                                    <em value={null}>NINGUNA</em>
                                                </MenuItem>
                                                {
                                                    context.catData?.categoryList?.length !== 0 && context.catData?.categoryList?.map((cat, index) => {
                                                        return (
                                                            <MenuItem className="text-capitalize" value={cat._id} key={index}
                                                                onClick={() => selectCat(cat.name,cat._id)}
                                                            >{cat.name}</MenuItem>
                                                        )
                                                    })
                                                }

                                            </Select>
                                        </div>
                                    </div>



                                    <div className='col'>
                                        <div className='form-group'>
                                            <h6>SUB CATEGORIA</h6>
                                            <Select
                                                value={subCatVal}
                                                onChange={handleChangeSubCategory}
                                                displayEmpty
                                                inputProps={{ 'aria-label': 'Without label' }}
                                                className='w-100'
                                            >
                                                <MenuItem value="">
                                                    <em value={null}>NINGUNA</em>
                                                </MenuItem>
                                                {
                                                    subCatData?.length !== 0 && subCatData?.map((subCat, index) => {
                                                        return (
                                                            <MenuItem className="text-capitalize" value={subCat._id} key={index}
                                                            onClick={()=>selectSubCat(subCat.name, subCat._id)}
                                                            >{subCat.name}</MenuItem>
                                                        )
                                                    })
                                                }

                                            </Select>
                                        </div>
                                    </div>
                                    <div className='col'>
                                        <div className='form-group'>
                                            <h6>Precio</h6>
                                            <input type='text' name="price" value={formFields.price} onChange={inputChange} />
                                        </div>
                                    </div>
                                </div>

                                <div className='row'>
                                    <div className='col'>
                                        <div className='form-group'>
                                            <h6>Antiguo precio</h6>
                                            <input type='text' name="oldPrice" value={formFields.oldPrice} onChange={inputChange} />
                                        </div>
                                    </div>

                                    <div className='col'>
                                        <div className='form-group'>
                                            <h6 className='text-uppercase'>is Featured</h6>
                                            <Select
                                                value={isFeaturedValue}
                                                onChange={handleChangeisFeaturedValue}
                                                displayEmpty
                                                inputProps={{ 'aria-label': 'Without label' }}
                                                className='w-100'
                                            >
                                                <MenuItem value="">
                                                    <em value={null}>None</em>
                                                </MenuItem>
                                                <MenuItem value={true}>True</MenuItem>
                                                <MenuItem value={false}>False</MenuItem>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className='col'>
                                        <div className='form-group'>
                                            <h6>Stock del Producto</h6>
                                            <input type='text' name="countInStock" value={formFields.countInStock} onChange={inputChange} />
                                        </div>
                                    </div>
                                </div>

                                <div className='row'>
                                    <div className='col-md-4'>
                                        <div className='form-group'>
                                            <h6>Marca</h6>
                                            <input type='text' name="brand" value={formFields.brand} onChange={inputChange} />
                                        </div>
                                    </div>

                                    <div className='col-md-4'>
                                        <div className='form-group'>
                                            <h6>Descuento</h6>
                                            <input type='text' name="discount" value={formFields.discount} onChange={inputChange} />
                                        </div>
                                    </div>

                                    <div className='col-md-4'>
                                        <div className='form-group'>
                                            <h6>RAM del producto</h6>
                                            <Select
                                                multiple
                                                value={productRams}
                                                onChange={handleChangeProductRams}
                                                displayEmpty
                                                className='w-100'
                                                MenuProps={MenuProps}
                                            >
                                                {productRAMSData?.map((item, index) => (
                                                    <MenuItem value={item.productRam}>{item.productRam}</MenuItem>
                                                ))}
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <div className='row'>
                                    <div className='col-md-4'>
                                        <div className='form-group'>
                                            <h6>Peso del Producto</h6>
                                            <Select
                                                multiple
                                                value={productWeight}
                                                onChange={handleChangeProductWeight}
                                                displayEmpty
                                                MenuProps={MenuProps}
                                                className='w-100'
                                            >
                                                {productWEIGHTData?.map((item, index) => (
                                                    <MenuItem value={item.productWeight}>{item.productWeight}</MenuItem>
                                                ))}
                                            </Select>
                                        </div>
                                    </div>

                                    <div className='col-md-4'>
                                        <div className='form-group'>
                                            <h6>Medida del Producto</h6>
                                            <Select
                                                multiple
                                                value={productSize}
                                                onChange={handleChangeProductSize}
                                                displayEmpty
                                                MenuProps={MenuProps}
                                                className='w-100'
                                            >
                                                {productSIZEData?.map((item, index) => (
                                                    <MenuItem value={item.size}>{item.size}</MenuItem>
                                                ))}
                                            </Select>
                                        </div>
                                    </div>

                                    <div className='col-md-4'>
                                        <div className='form-group'>
                                            <h6>Calificación</h6>
                                            <Rating
                                                name="simple-controlled"
                                                value={ratingsValue}
                                                onChange={(event, newValue) => {
                                                    setRatingValue(newValue);
                                                    setFormFields(() => ({
                                                        ...formFields,
                                                        rating: newValue
                                                    }));
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className='col-md-4'>
                                        <div className='form-group'>
                                            <h6>Ubicación</h6>
                                            {context.countryList?.length !== 0 && <CountryDropdown countryList={context.countryList} selectedLocation={context.selectedCountry} />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    
                            <Button type="submit" className="btn-blue btn-lg btn-big w-100">
                                <FaCloudUploadAlt /> &nbsp; {isLoading === true ? <CircularProgress color="inherit" className="loader" /> : 'PUBLICAR Y VER'}
                            </Button>
                       
                </form>
            </div>
        </>
    );
};

// VIII. Exportación del componente
export default EditUpload;
