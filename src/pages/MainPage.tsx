import { useEffect } from "react";
import { Box, Grid, Theme } from "@mui/material";
import MapCarousel from "../components/carousel/Carousel";
import DataTable from "../components/table/DataTable";
import F1AutoComplete, {
  driversEmptyOption,
} from "../components/autocomplete/F1AutoComplete";
import { yearCircuitMap } from "../components/F1Data/YearCircuitMap";
import DataTableQuali from "../components/table/DataTableQuali";
import useStateHelper from "./useStateHelper";
import { CircuitFE } from "../types/CircruitFE";
import { yearSprintRaceMap } from "../components/F1Data/SprintRaces";
import { Driver } from "../types/driver";
import DriverAutoComplete from "../components/autocomplete/DriverAutoComplete";

interface Props {
  theme: Theme;
  drivers?: Driver[];
}

const MainPage = ({ theme, drivers }: Props) => {
  const {
    goToCircuit,
    setGoToCircuit,
    selectedDriver,
    setSelectedDriver,
    selectedRaceData,
    modifiedRaceData,
    setModifiedRaceData,
    year,
    allCircuits,
    allCircuitsForYear,
    setAllCircuitsForYear,
    allDrivers,
    modifiedDrivers,
    setModifiedDrivers,
    eventValue,
    getF1Data,
    allTrackOptions,
    allYearOptions,
    allEventOptions,
    handleSelectChangeCircuit,
    handleChangeYear,
    handleChangeEvent,
    getResultFromObjectBasedOnEventType,
    eventOptions,
    setEventOptions,
  } = useStateHelper(drivers ?? []);

  // Effects
  useEffect(() => {
    const circuits: CircuitFE[] = [];
    yearCircuitMap.get(year.toString())?.forEach((value) => {
      const c = allCircuits.find((circuit) => circuit?.circuitId === value);
      if (c != null) circuits.push(c);
    });

    const filteredCircuits = allCircuits.filter((circuit) =>
      yearCircuitMap.get(year.toString())?.includes(circuit?.circuitId)
    );
    setAllCircuitsForYear(circuits);
    getF1Data(filteredCircuits[0]?.circuitId);
  }, [year]);

  useEffect(() => {
    const selectedCircuitId = allCircuitsForYear[goToCircuit]?.circuitId;
    if (!yearSprintRaceMap.get(year.toString())?.includes(selectedCircuitId)) {
      setEventOptions(eventOptions.filter((option) => option.id !== "sprint"));
      eventValue === "sprint" && handleChangeEvent("results");
    } else {
      setEventOptions(allEventOptions);
    }
    getF1Data(selectedCircuitId);
  }, [goToCircuit, eventValue]);

  useEffect(() => {
    setSelectedDriver(driversEmptyOption);
  }, [eventValue]);

  useEffect(() => {
    setModifiedRaceData(selectedRaceData);
    const res = getResultFromObjectBasedOnEventType(selectedRaceData);
    const driverIdsInSelectedRace: string[] =
      res.map((row) => row?.Driver?.driverId) ?? [];
    setModifiedDrivers(
      allDrivers.filter((driver) =>
        driverIdsInSelectedRace?.includes(driver.driverRef)
      )
    );
  }, [selectedRaceData]);

  useEffect(() => {
    if (selectedDriver.id == "") {
      setModifiedRaceData(selectedRaceData);
      return;
    }

    const { season, circuitId, Races } = selectedRaceData;

    const filteredResults = getResultFromObjectBasedOnEventType(
      selectedRaceData
    ).filter((row) => row.Driver.driverId === selectedDriver.id);

    const { Results, SprintResults, QualifyingResults, ...rest } = Races[0];
    setModifiedRaceData({
      season,
      circuitId,
      Races: [
        {
          Results: filteredResults,
          SprintResults: filteredResults,
          QualifyingResults: filteredResults,
          ...rest,
        },
      ],
    });
  }, [selectedDriver]);

  const selectedRaceResults =
    getResultFromObjectBasedOnEventType(modifiedRaceData);

  return (
    <>
      <Box
        sx={{
          marginTop: "180px",
        }}
      >
        <MapCarousel
          height={"230px"}
          width={"50%"}
          margin={"0 auto"}
          offset={4}
          goToSlide={goToCircuit}
          setGoToSlide={setGoToCircuit}
          allCircuits={allCircuitsForYear}
        />
      </Box>

      <Box
        sx={{
          paddingTop: "6rem",
          width: "80%",
          margin: "0 auto",
        }}
      >
        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid item xs={3}>
            <F1AutoComplete
              allOptions={eventOptions}
              handleSelectChange={handleChangeEvent}
              label="Event Type"
              val={eventOptions?.find((element) => element.id === eventValue)}
            />
          </Grid>
          <Grid item xs={3}>
            <F1AutoComplete
              allOptions={allYearOptions}
              handleSelectChange={handleChangeYear}
              label="Years"
              val={allYearOptions?.find(
                (element) => element.label === year.toString()
              )}
            />
          </Grid>
          <Grid item xs={3}>
            <F1AutoComplete
              allOptions={allTrackOptions}
              handleSelectChange={handleSelectChangeCircuit}
              label="Tracks"
              val={allTrackOptions[goToCircuit]}
            />
          </Grid>
          <Grid item xs={3}>
            <DriverAutoComplete
              modifiedDrivers={modifiedDrivers}
              selectedDriver={selectedDriver}
              setSelectedDriver={setSelectedDriver}
            />
          </Grid>
          <Grid item xs={12}>
            {eventValue === "qualifying" && (
              <DataTableQuali
                selectedRaceData={selectedRaceResults}
                notFound={`No qualifying available for ${allCircuits[goToCircuit]?.name} in ${year} or selected driver`}
                theme={theme}
              />
            )}
            {eventValue !== "qualifying" && (
              <DataTable
                selectedRaceData={selectedRaceResults}
                notFound={`No results available for ${allCircuits[goToCircuit]?.name} in ${year} or selected driver`}
                theme={theme}
              />
            )}
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default MainPage;
