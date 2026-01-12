import {useEffect, useState} from "react";
import type {Artwork} from "./types";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {OverlayPanel} from "primereact/overlaypanel";
import {InputNumber} from "primereact/inputnumber";
import {Button} from "primereact/button";
import {useRef} from "react";


function App() {
  const [artworks,setArtworks]=useState<Artwork[]>([]);
  const [page,setPage]=useState(0);
  const [rows,setRows]=useState(12);
  const [totalRecords,setTotalRecords]=useState(0);
  const [selectedIds,setSelectedIds]=useState<Set<number>>(new Set());
  const overlayRef = useRef<OverlayPanel>(null);
  const [selectCount,setSelectCount]=useState<number|null>(null);

  useEffect(()=>{
    fetch(`https://api.artic.edu/api/v1/artworks?page=${page + 1}&limit=${rows}`)
      .then((res)=>res.json())
      .then((data)=>{
        setArtworks(data.data);
        setTotalRecords(data.pagination.total);
      })
      .catch((err)=>{
        console.error("Error fetching artworks:",err);
      });
  }, [page,rows])

  const selectedRows =artworks.filter((art) =>selectedIds.has(art.id));

  const onSelectionChange=(e: any)=>{
    const newSet = new Set<number>();
    e.value.forEach((row: Artwork)=>{
      newSet.add(row.id);
    });
    selectedIds.forEach((id)=>{
      if (!artworks.some((art)=>art.id === id)){
        newSet.add(id);
      }
    });
    setSelectedIds(newSet);
  };


  const handleCustomSelection=()=>{
    if(!selectCount || selectCount<=0) return;

    const newSet=new Set(selectedIds);

    artworks.slice(0,selectCount).forEach((art)=>{
      newSet.add(art.id);
    });

    setSelectedIds(newSet);
    overlayRef.current?.hide();
  };


  return (
    <div style={{padding: "20px",width: "100%"}}>
      <h2>Art Institute of Chicago - Artworks</h2>

      <OverlayPanel ref={overlayRef}>
        <div style={{display: "flex",flexDirection: "column",gap: "10px",width: "220px"}}>
          <strong>Select Multiple Rows</strong>
          <span style={{fontSize: "12px",color: "#666"}}>
            Enter number of rows to select on this page
          </span>

          <InputNumber
            value={selectCount}
            onValueChange={(e)=>setSelectCount(e.value ?? null)}
            min={1}
            max={artworks.length}
            placeholder="e.g. 5"
          />

          <Button label="Select" onClick={handleCustomSelection}/>
        </div>
      </OverlayPanel>

      <p>Selected:{selectedIds.size}rows</p>
      <DataTable
        value={artworks}
        stripedRows
        paginator
        rows={rows}
        totalRecords={totalRecords}
        lazy
        first={page * rows}
        selection={selectedRows}
        onSelectionChange={onSelectionChange}
        selectionMode="multiple"
        dataKey="id"
        rowsPerPageOptions={[12,24,48]}
        onPage={(e) => {
          setPage(e.page ?? 0);
          setRows(e.rows ?? 12);
        }}
      >

        <Column
          selectionMode="multiple"
          header={
            <div
              style={{
                display:"flex",
                alignItems:"center",
                gap:"6px",
                marginLeft:"4px"
              }}
            >
              <Button
                icon="pi pi-chevron-down"
                text
                onClick={(e)=>overlayRef.current?.toggle(e)}
              />
            </div>
          }
          headerStyle={{width: "3.5rem"}}
        />

        <Column field="title" header="TITLE" />
        <Column field="place_of_origin" header="ORIGIN" />
        <Column field="artist_display" header="ARTIST" />
        <Column field="inscriptions" header="INSCRIPTIONS" />
        <Column field="date_start" header="START DATE" />
        <Column field="date_end" header="END DATE" />
      </DataTable>

    </div>
  );

}

export default App;
