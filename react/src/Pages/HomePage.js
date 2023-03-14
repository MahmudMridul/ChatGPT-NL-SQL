import React, { useState } from 'react'
import { Box, TextField, Button, Grid } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import CircularProgress from '@mui/material/CircularProgress'
import axios from 'axios'


export default function HomePage() {

    const [isShown, setIsShown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState("")
    const [rows, setRows] = useState([])
    const [columns, setColumns] = useState([])

    const handleClick = () => {
        getDisplayData();   
    }

    const data = {
        request: search
    }

    function getDisplayData() {
        console.log(JSON.stringify(data))
        setIsShown(false);
        setIsLoading(true);
        axios
            .post("http://127.0.0.1:5000/api/submit", data)
            .then((response) => {
                if (response.data === -1){
                    alert("Something went wrong")
                    setIsLoading(false);
                    setIsShown(false);
                }
                else if (response.data.length) {
                    const rows = response.data.map((row) => {
                        const { brandid, ...rest } = row;
                        return { id: brandid, ...rest }
                    })
                    setRows(rows);


                    const firstRow = rows[0];

                    const dataColumns = Object.keys(firstRow)
                        .filter(key => key !== 'id')
                        .map(field => ({
                            field,
                            headerName: field.charAt(0).toUpperCase() + field.slice(1),
                            flex: 1
                        }))

                    setColumns(dataColumns);
                    setIsLoading(false);
                    setIsShown(response.data.length > 0);
                }
                else if(response.data.length === 0){
                    alert("No Data Found!")
                    setIsShown(false)
                    setIsLoading(false);
                }
            })
    }

    return (
        <div>
            <Box sx={{ ml: '15rem', mt: '10rem', mr: '15rem' }}>
                <Grid container columns={12} sx={{ ml: '10rem', mr: '10rem', mb: '5rem' }}>
                    <Grid item sx={{ ml: "9rem" }} md={6}>
                        <h1>ChatGPT Model</h1>
                    </Grid>
                    <Grid item md={6}>
                        <TextField sx={{ width: 500, borderRadius: 3, border: '1px solid gray' }} onChange={(e) => setSearch(e.target.value)} />
                        <Button sx={{ ml: "12rem", mt: 1 }} variant='contained' onClick={handleClick}>Search</Button>
                        {
                            isLoading &&
                            <Box sx={{ display: 'flex', ml: "13.8rem", mt: 4 }}>
                                <CircularProgress />
                            </Box>
                        }
                    </Grid>
                </Grid>
                {isShown &&
                <Grid container columns={12}>
                    <Grid item md={12}>
                        <DataGrid 
                        rows={rows} 
                        columns={columns} 
                        autoHeight = {true}
                        pageSize={5}
                        rowsPerPageOption={5}></DataGrid>
                    </Grid>
                </Grid>
                }
            </Box>
        </div>
    )
}