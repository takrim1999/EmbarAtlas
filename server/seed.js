import { initDb, getDb } from './db.js';

// Initialize the database schema
initDb();
const db = getDb();

console.log('🌱 Seeding Ember Atlas database...\n');

// ── Clear existing data ──────────────────────────────────────────────────────
db.exec('DELETE FROM experimental_data');
db.exec('DELETE FROM ai_conversations');
db.exec('DELETE FROM investigations');
console.log('🗑️  Cleared existing data');

// ── Prepare insert statements ────────────────────────────────────────────────
const insertInvestigation = db.prepare(`
  INSERT INTO investigations (
    id, name, title, topic, fuel_type, summary, objectives, approach, relevance,
    conditions, measurements, limitations, hardware, facility, url, doi,
    source_section, license, year_start, year_end, gravity_regime,
    safety_relevance_score, tags, related_investigations, earthApplications
  ) VALUES (
    @id, @name, @title, @topic, @fuel_type, @summary, @objectives, @approach, @relevance,
    @conditions, @measurements, @limitations, @hardware, @facility, @url, @doi,
    @source_section, @license, @year_start, @year_end, @gravity_regime,
    @safety_relevance_score, @tags, @related_investigations, @earthApplications
  )
`);

const insertData = db.prepare(`
  INSERT INTO experimental_data (
    investigation_id, test_id, fuel, pressure_mmhg, oxygen_mole_fraction,
    initial_diameter_mm, extinction_diameter_mm, burn_time_s, flame_spread_rate,
    flow_velocity, sample_material, sample_geometry, temperature_c, test_end, notes
  ) VALUES (
    @investigation_id, @test_id, @fuel, @pressure_mmhg, @oxygen_mole_fraction,
    @initial_diameter_mm, @extinction_diameter_mm, @burn_time_s, @flame_spread_rate,
    @flow_velocity, @sample_material, @sample_geometry, @temperature_c, @test_end, @notes
  )
`);

// ── Investigation Data ───────────────────────────────────────────────────────
const investigations = [
  {
    id: 'PSI-69',
    name: 'FLEX',
    title: 'Flame Extinguishment Experiment',
    topic: 'combustion_science',
    fuel_type: 'liquid (alkane droplets)',
    summary: 'FLEX studied the burning and extinction of individual fuel droplets in microgravity to understand the conditions under which flames self-extinguish. The investigation revealed the phenomenon of "cool flames" — sustained low-temperature combustion that continues after the visible flame extinguishes — a discovery with profound implications for fire safety and combustion science.',
    objectives: 'Determine the extinction conditions (droplet diameter at flame extinction) for a range of fuels, pressures, and oxygen concentrations in quiescent microgravity. Validate theoretical droplet-combustion models. Characterize the transition from hot-flame to cool-flame combustion.',
    approach: 'Free-floating single fuel droplets were ignited in the Combustion Integrated Rack (CIR) aboard ISS and allowed to burn. High-speed cameras recorded droplet regression and flame behavior. Radiometers measured heat release. Tests varied fuel type, initial droplet diameter, ambient oxygen mole fraction, and total pressure.',
    relevance: 'Droplet combustion is a canonical model for spray flames used in engines and industrial burners. Understanding extinction limits in microgravity informs fire suppression strategies in spacecraft where buoyancy-driven flows are absent.',
    conditions: 'Pressures: 0.5–3 atm. Oxygen mole fractions: 0.10–0.40 in N₂ or He diluent. Fuels: n-heptane, methanol, decane, nonane, dodecane. Initial droplet diameters: 1.5–5.0 mm. Ambient temperature: ~25 °C.',
    measurements: 'Droplet diameter vs time (d² law), extinction diameter, burn rate constant, flame standoff ratio, radiative heat loss, cool-flame duration, soot volume fraction.',
    limitations: 'Limited number of tests per fuel–condition pair. Droplet deployment introduces small residual velocities. Radiometer signal may not capture low-luminosity cool-flame radiation. No gas-phase species measurements in situ.',
    hardware: 'CIR (Combustion Integrated Rack) with MDCA (Multi-user Droplet Combustion Apparatus)',
    facility: 'ISS – US Destiny Laboratory',
    url: 'https://www.nasa.gov/mission/station/research-explorer/investigation/?#id=110',
    doi: null,
    source_section: 'PSI Combustion Science – Droplet Combustion',
    license: 'CC0-1.0',
    year_start: 2009,
    year_end: 2014,
    gravity_regime: 'microgravity',
    safety_relevance_score: 8.5,
    tags: JSON.stringify(['droplet combustion', 'extinction', 'cool flames', 'CIR', 'MDCA', 'heptane', 'methanol', 'fire suppression', 'soot']),
    related_investigations: JSON.stringify(['PSI-70', 'CFI']),
    earthApplications: 'Improved combustion efficiency in diesel engines and gas turbines; better fire suppressant design; cool-flame chemistry relevant to low-temperature ignition in engines (HCCI).',
  },
  {
    id: 'PSI-70',
    name: 'FLEX-2',
    title: 'Flame Extinguishment Experiment – 2',
    topic: 'combustion_science',
    fuel_type: 'liquid (alkane droplets)',
    summary: 'FLEX-2 extended the FLEX investigation to a broader parameter space, focusing on sooting fuels and the dual-stage burning phenomenon. It confirmed that cool-flame burning can persist for extended periods after visible flame extinction and that soot shell formation significantly alters burn dynamics.',
    objectives: 'Expand the FLEX dataset to additional fuels and conditions. Study the influence of soot aggregation on droplet burning. Quantify cool-flame burning rates and durations. Provide validation data for computational models of two-stage combustion.',
    approach: 'Same CIR/MDCA hardware as FLEX. Added emphasis on heavily sooting fuels (decane, dodecane) and wider pressure ranges. Fiber-supported and free-floating deployments. Backlit imaging for droplet tracking; color camera for flame visualization.',
    relevance: 'Extended the cool-flame discovery to practical fuels. Demonstrated that radiative extinction (not just diffusive) can dominate in microgravity, informing fire behavior in oxygen-enriched spacecraft atmospheres.',
    conditions: 'Pressures: 0.7–3 atm. O₂ mole fractions: 0.15–0.40. Fuels: n-decane, n-dodecane, methanol, heptane mixtures. Droplet diameters: 2.0–5.5 mm.',
    measurements: 'Droplet diameter history, extinction diameter, soot shell diameter, burn rate constant, cool-flame duration, flame color transitions, radiometer time-traces.',
    limitations: 'Fiber-supported tests introduce heat loss along the fiber. Soot shell opacity makes droplet tracking uncertain at late times. No direct measurement of gas-phase temperature field.',
    hardware: 'CIR with MDCA',
    facility: 'ISS – US Destiny Laboratory',
    url: 'https://www.nasa.gov/mission/station/research-explorer/investigation/?#id=1316',
    doi: null,
    source_section: 'PSI Combustion Science – Droplet Combustion',
    license: 'CC0-1.0',
    year_start: 2014,
    year_end: 2017,
    gravity_regime: 'microgravity',
    safety_relevance_score: 8.0,
    tags: JSON.stringify(['droplet combustion', 'cool flames', 'soot', 'extinction', 'CIR', 'MDCA', 'decane', 'dodecane', 'radiative extinction']),
    related_investigations: JSON.stringify(['PSI-69', 'CFI']),
    earthApplications: 'Soot formation models for emissions control; two-stage ignition understanding for diesel/HCCI engines; fire suppression agent effectiveness.',
  },
  {
    id: 'PSI-24',
    name: 'BASS',
    title: 'Burning and Suppression of Solids',
    topic: 'prevention',
    fuel_type: 'solid (flat samples)',
    summary: 'BASS examined how solid materials burn and are suppressed in microgravity, directly informing spacecraft material selection and fire suppression strategies. The investigation tested flame spread over thin and thick solid samples in varied oxygen and flow conditions, providing NASA with data to improve material flammability screening tests (NASA-STD-6001 Test 1).',
    objectives: 'Measure flame spread rates over solid fuels in quiescent and low-speed flow microgravity. Determine flammability limits (minimum oxygen concentration for sustained burning). Evaluate the effectiveness of CO₂ and N₂ suppressants. Provide data to improve ground-based material selection tests.',
    approach: 'Flat solid samples (PMMA, cotton-fiberglass fabric, Nomex) were ignited in the Microgravity Science Glovebox (MSG) aboard ISS. Flow velocity and oxygen concentration were controlled. Cameras recorded flame position over time. Tests were conducted at ISS cabin atmosphere (~21% O₂, 1 atm) and reduced-O₂ conditions.',
    relevance: 'Directly supports NASA material flammability standards. Provides the only true microgravity flame-spread data for common spacecraft materials. Essential for certifying materials for Artemis lunar surface habitats.',
    conditions: 'Oxygen: 17–24% in N₂ at 1 atm. Flow velocities: 0–10 cm/s. Sample thickness: 50 µm–2 mm. Ambient temperature: ~23 °C.',
    measurements: 'Flame spread rate (mm/s), flame standoff distance, extinction limits, sample burnout patterns, suppression effectiveness (CO₂ concentration to extinguish).',
    limitations: 'MSG volume limits sample size and test duration. Cabin air currents may introduce uncontrolled flow. Only flat, upward-facing samples tested — geometry effects not characterized.',
    hardware: 'MSG (Microgravity Science Glovebox)',
    facility: 'ISS – US Destiny Laboratory',
    url: 'https://www.nasa.gov/mission/station/research-explorer/investigation/?#id=729',
    doi: null,
    source_section: 'PSI Fire Safety – Material Flammability',
    license: 'CC0-1.0',
    year_start: 2011,
    year_end: 2013,
    gravity_regime: 'microgravity',
    safety_relevance_score: 9.5,
    tags: JSON.stringify(['flame spread', 'material flammability', 'PMMA', 'cotton', 'fire suppression', 'MSG', 'NASA-STD-6001', 'solid combustion']),
    related_investigations: JSON.stringify(['PSI-25', 'PSI-98', 'PSI-99', 'PSI-100']),
    earthApplications: 'Improved fire safety standards for building materials; textile flammability testing; understanding smoldering combustion in low-ventilation environments.',
  },
  {
    id: 'PSI-25',
    name: 'BASS-II',
    title: 'Burning and Suppression of Solids – II',
    topic: 'prevention',
    fuel_type: 'solid (flat and cylindrical samples)',
    summary: 'BASS-II extended the BASS investigation with larger samples, additional materials, and controlled low-speed flows to map the flammability boundaries of spacecraft materials more comprehensively. It introduced acrylic rod samples to study three-dimensional flame spread and provided data on the transition from smoldering to flaming combustion.',
    objectives: 'Map flammability boundaries (O₂ concentration vs flow velocity) for additional spacecraft materials. Study concurrent and opposed-flow flame spread. Investigate the smoldering-to-flaming transition. Test fire detection sensor response to microgravity flames.',
    approach: 'Expanded sample set including SIBAL (silicone-based material), Mylar, acrylic rods, and composite fabric. Tests in MSG with improved flow control (0–25 cm/s). Simultaneous smoke-detector sensor measurements. Both concurrent- and opposed-flow configurations.',
    relevance: 'Extended flammability maps directly inform spacecraft cabin atmosphere design (O₂ concentration) and material selection for Orion, Gateway, and lunar surface habitats. Smoke-detector response data validates detection system performance.',
    conditions: 'Oxygen: 15–26% in N₂ at 0.7–1.0 atm. Flow velocities: 0–25 cm/s. Sample materials: PMMA, SIBAL, Mylar, acrylic rods, composite fabrics. Pressures simulating ISS and planned Exploration atmospheres (8.2 psi / 34% O₂).',
    measurements: 'Flame spread rate, flame shape, extinction oxygen limit, smoldering temperature, smoke production rate, smoke-detector alarm times, sample mass loss rate.',
    limitations: 'Still limited to MSG volume. Smoke-detector placement may not represent spacecraft installation geometry. Rod geometry limits comparison to flat-panel configurations.',
    hardware: 'MSG (Microgravity Science Glovebox)',
    facility: 'ISS – US Destiny Laboratory',
    url: 'https://www.nasa.gov/mission/station/research-explorer/investigation/?#id=7593',
    doi: null,
    source_section: 'PSI Fire Safety – Material Flammability',
    license: 'CC0-1.0',
    year_start: 2014,
    year_end: 2016,
    gravity_regime: 'microgravity',
    safety_relevance_score: 9.5,
    tags: JSON.stringify(['flame spread', 'material flammability', 'smoke detection', 'PMMA', 'SIBAL', 'smoldering', 'MSG', 'exploration atmosphere']),
    related_investigations: JSON.stringify(['PSI-24', 'PSI-98', 'PSI-99', 'PSI-100']),
    earthApplications: 'Improved textile and insulation fire safety standards; smoke detector design for low-ventilation environments; fire safety in submarines and sealed habitats.',
  },
  {
    id: 'PSI-98',
    name: 'Saffire-I',
    title: 'Spacecraft Fire Experiment – I',
    topic: 'detection',
    fuel_type: 'solid (cotton-fiberglass blend)',
    summary: 'Saffire-I was the first large-scale fire experiment in space, conducted inside an uncrewed Cygnus cargo vehicle after it departed ISS. It ignited a meter-scale sample of cotton-fiberglass fabric to study flame growth and behavior at a scale never before achieved in microgravity, providing critical data for validating fire growth models.',
    objectives: 'Conduct the first large-scale (0.4 m wide × 0.95 m long) microgravity fire. Observe flame spread behavior, including whether flame growth accelerates or self-limits. Validate computational fire-growth models (e.g., NASA\'s Fire Dynamics Simulator adaptations). Assess whether current material screening tests are conservative for large-scale fires.',
    approach: 'A single cotton-fiberglass blend sample was ignited by a hot wire at one end inside a sealed flow duct within Cygnus. Airflow was provided at a controlled velocity. Nine cameras captured flame progression. Thermocouples and radiometers recorded thermal environment. O₂ and CO₂ sensors tracked atmospheric changes.',
    relevance: 'Provided the first and only data on fire behavior at vehicle-representative scale in microgravity. Essential for validating fire growth models used in spacecraft design. Directly addresses the question: "How big can a fire get in a spacecraft?"',
    conditions: 'Atmosphere: ~21% O₂ at 1 atm (ISS-derived). Flow velocity: ~20 cm/s. Sample: cotton-fiberglass blend, 0.4 m × 0.95 m. Single ignition point at upstream end. Duct dimensions: ~50 cm × 50 cm cross-section.',
    measurements: 'Flame front position vs time, flame spread rate, peak heat flux (radiometers), gas temperature profiles (thermocouple rake), O₂ depletion rate, CO₂ production rate, flame length, total burn time.',
    limitations: 'Single test — no replication. Fixed atmosphere and flow. Only one material tested. Post-ISS trajectory means limited real-time data downlink. Cygnus reentry destroys hardware — no post-test sample analysis.',
    hardware: 'Custom Saffire flow duct with igniter, cameras, TC rake, radiometers',
    facility: 'Northrop Grumman Cygnus cargo vehicle (uncrewed, post-ISS departure)',
    url: 'https://www.nasa.gov/mission/station/research-explorer/investigation/?#id=1865',
    doi: null,
    source_section: 'PSI Fire Safety – Large-Scale Fire',
    license: 'CC0-1.0',
    year_start: 2016,
    year_end: 2016,
    gravity_regime: 'microgravity',
    safety_relevance_score: 10.0,
    tags: JSON.stringify(['large-scale fire', 'Cygnus', 'flame spread', 'fire growth', 'cotton-fiberglass', 'fire modeling', 'fire detection', 'spacecraft fire']),
    related_investigations: JSON.stringify(['PSI-99', 'PSI-100', 'PSI-24', 'PSI-25']),
    earthApplications: 'Fire growth modeling for buildings and transportation; large-scale fire behavior understanding; ventilation effects on fire growth in sealed structures.',
  },
  {
    id: 'PSI-99',
    name: 'Saffire-II',
    title: 'Spacecraft Fire Experiment – II',
    topic: 'detection',
    fuel_type: 'solid (multiple materials)',
    summary: 'Saffire-II tested nine smaller material samples in microgravity to provide comparison data for Saffire-I. It examined the flame resistance of candidate spacecraft materials including Nomex and other advanced fabrics, and tested improved fire detection sensors including a new particulate sensor design.',
    objectives: 'Screen multiple candidate spacecraft materials for flammability in microgravity at moderate scale. Test and validate new fire detection sensor technologies. Provide replicate data points for statistical confidence. Compare results to existing NASA-STD-6001 ground-test rankings.',
    approach: 'Nine individual samples (various materials) were ignited sequentially in a Cygnus-based flow duct. Each sample was ~5 cm × 30 cm. Smoke and gas sensors downstream monitored fire signatures. Same flow-duct architecture as Saffire-I but with a sample carousel.',
    relevance: 'Provided microgravity flammability screening for multiple materials in a single mission, enabling direct comparison. Tested next-generation fire detection technology. Validated (or challenged) ground-based material rankings.',
    conditions: 'Atmosphere: ~21% O₂ at 1 atm. Flow: ~20 cm/s. Materials: cotton-fiberglass blend (reference), Nomex, silicone-coated fiberglass, SIBAL cloth, Mylar, other candidates. Each sample: ~5 × 30 cm.',
    measurements: 'Flame spread rate per sample, GO/NO-GO flammability, smoke sensor response curves, gas sensor (CO, CO₂) time traces, visual flame imaging.',
    limitations: 'Smaller sample size than Saffire-I limits scalability conclusions. Single atmosphere and flow condition. Sequential ignition means later samples experience slightly modified atmosphere.',
    hardware: 'Saffire sample carousel, flow duct, fire detection sensor suite',
    facility: 'Northrop Grumman Cygnus cargo vehicle',
    url: 'https://www.nasa.gov/mission/station/research-explorer/investigation/?#id=1866',
    doi: null,
    source_section: 'PSI Fire Safety – Material Screening',
    license: 'CC0-1.0',
    year_start: 2016,
    year_end: 2016,
    gravity_regime: 'microgravity',
    safety_relevance_score: 9.0,
    tags: JSON.stringify(['material screening', 'fire detection', 'Nomex', 'SIBAL', 'Cygnus', 'Saffire', 'flammability', 'smoke sensor']),
    related_investigations: JSON.stringify(['PSI-98', 'PSI-100', 'PSI-24', 'PSI-25']),
    earthApplications: 'Advanced fire detection sensor development; material screening methodology improvement; fire-resistant fabric evaluation for protective clothing.',
  },
  {
    id: 'PSI-100',
    name: 'Saffire-III',
    title: 'Spacecraft Fire Experiment – III',
    topic: 'detection',
    fuel_type: 'solid (cotton-fiberglass blend)',
    summary: 'Saffire-III replicated the large-scale fire test of Saffire-I with modifications to study the effect of different flow conditions on fire growth at meter scale. It confirmed that buoyancy-free fires can grow to large sizes and provided replicate data critical for model validation and statistical analysis of fire behavior.',
    objectives: 'Replicate Saffire-I at a different flow velocity to isolate ventilation effects. Provide statistical confidence in large-scale fire data. Test improved fire detection sensors. Study post-fire atmospheric composition and particulate loading.',
    approach: 'Same configuration as Saffire-I with a 0.4 × 0.95 m cotton-fiberglass sample. Modified flow velocity and enhanced sensor suite including particle-size spectrometer. Improved camera resolution and frame rate.',
    relevance: 'Replicate data is essential for validating fire-growth models. Different flow velocity tests isolate ventilation as a fire-growth variable, directly relevant to spacecraft HVAC system design and emergency ventilation shutdown protocols.',
    conditions: 'Atmosphere: ~21% O₂ at 1 atm. Flow: varied from Saffire-I (specific velocity adjusted). Sample: cotton-fiberglass blend, 0.4 × 0.95 m.',
    measurements: 'Flame spread rate, flame length, heat flux, gas temperature, O₂/CO₂/CO concentrations, particulate size distribution, smoke density, total burn duration.',
    limitations: 'Same single-test limitation as Saffire-I (one large sample per mission). Material limited to cotton-fiberglass blend. Cygnus destructive reentry prevents post-test analysis.',
    hardware: 'Saffire flow duct (upgraded sensors), particle spectrometer',
    facility: 'Northrop Grumman Cygnus cargo vehicle',
    url: 'https://www.nasa.gov/mission/station/research-explorer/investigation/?#id=7679',
    doi: null,
    source_section: 'PSI Fire Safety – Large-Scale Fire',
    license: 'CC0-1.0',
    year_start: 2017,
    year_end: 2017,
    gravity_regime: 'microgravity',
    safety_relevance_score: 10.0,
    tags: JSON.stringify(['large-scale fire', 'Cygnus', 'Saffire', 'fire modeling', 'ventilation', 'fire growth', 'particle spectrometer', 'replicate data']),
    related_investigations: JSON.stringify(['PSI-98', 'PSI-99']),
    earthApplications: 'Ventilation effects on fire growth in enclosed spaces; fire model validation for buildings; smoke dispersion modeling.',
  },
  {
    id: 'PSI-102',
    name: 'SAME',
    title: 'Smoke Aerosol Measurement Experiment',
    topic: 'detection',
    fuel_type: 'solid (various reference materials)',
    summary: 'SAME characterized the size, morphology, and concentration of smoke particles produced by overheating and burning spacecraft-relevant materials in microgravity. The data directly supported the design and calibration of next-generation fire detection systems for ISS and future vehicles.',
    objectives: 'Measure smoke particle size distributions for five reference materials pyrolyzed or burned in microgravity. Determine whether microgravity smoke differs from terrestrial smoke in ways that affect detector performance. Provide calibration targets for spacecraft smoke detectors.',
    approach: 'Small material samples were heated (pyrolysis) or ignited inside MSG. Smoke was collected and analyzed using a particle-sizing instrument (Dust-Trak and APS). Five materials chosen to represent the range of smoke types: Teflon, Kapton, lamp wick (cellulose), silicone rubber, and Pyrell foam.',
    relevance: 'Spacecraft fire detectors must reliably detect all smoke types while avoiding false alarms from dust. SAME provided the first microgravity smoke characterization data, enabling detector threshold optimization.',
    conditions: 'ISS cabin atmosphere (~21% O₂, 1 atm). Sample mass: 0.1–1 g. Heating by resistance wire (pyrolysis) or hot-wire ignition. MSG containment volume.',
    measurements: 'Particle number concentration, mass concentration, size distribution (0.1–10 µm), mean particle diameter, geometric standard deviation, particle morphology (inferred from mobility vs aerodynamic diameter).',
    limitations: 'MSG volume limits smoke dilution behavior. No controlled airflow — relies on diffusion. Limited number of materials. No long-duration aging of smoke aerosol. Particle instruments have size-range limits.',
    hardware: 'MSG, Dust-Trak aerosol monitor, APS (Aerodynamic Particle Sizer)',
    facility: 'ISS – US Destiny Laboratory',
    url: 'https://www.nasa.gov/mission/station/research-explorer/investigation/?#id=7617',
    doi: null,
    source_section: 'PSI Fire Safety – Smoke Detection',
    license: 'CC0-1.0',
    year_start: 2007,
    year_end: 2010,
    gravity_regime: 'microgravity',
    safety_relevance_score: 9.0,
    tags: JSON.stringify(['smoke detection', 'aerosol', 'particle size', 'Teflon', 'Kapton', 'fire detection', 'MSG', 'pyrolysis']),
    related_investigations: JSON.stringify(['PSI-101']),
    earthApplications: 'Smoke detector design and calibration for sealed environments (submarines, aircraft); aerosol science; indoor air quality monitoring.',
  },
  {
    id: 'PSI-101',
    name: 'SAME-R',
    title: 'Smoke Aerosol Measurement Experiment – Reflight',
    topic: 'detection',
    fuel_type: 'solid (various reference materials)',
    summary: 'SAME-R repeated and extended the SAME investigation with improved instrumentation and additional materials to refine the microgravity smoke characterization database. It provided higher-fidelity particle size data and tested materials relevant to next-generation spacecraft.',
    objectives: 'Replicate SAME measurements with improved particle-sizing accuracy. Test additional materials including those planned for Orion and Gateway. Provide statistical replication of key results. Study smoke aging effects over longer time scales.',
    approach: 'Improved particle-sizing instruments and additional material samples. Same MSG-based methodology as SAME with extended observation time after smoke generation to study aerosol coagulation and settling (absence of settling in microgravity).',
    relevance: 'Refined data for smoke detector development. Demonstrated that microgravity smoke particles grow larger through coagulation without settling, potentially affecting detector response differently than on Earth.',
    conditions: 'ISS cabin atmosphere. Extended material set including PMMA, Nomex, printed circuit board material, cable insulation. Observation periods up to 30 minutes post-generation.',
    measurements: 'Time-resolved particle size distributions, coagulation rates, particle number decay, mass concentration evolution, effective density ratios.',
    limitations: 'MSG volume constrains aerosol dynamics. No controlled ventilation. Limited replications per material. No electron microscopy of collected particles.',
    hardware: 'MSG, improved aerosol spectrometer suite',
    facility: 'ISS – US Destiny Laboratory',
    url: 'https://www.nasa.gov/mission/station/research-explorer/investigation/?#id=7618',
    doi: null,
    source_section: 'PSI Fire Safety – Smoke Detection',
    license: 'CC0-1.0',
    year_start: 2010,
    year_end: 2012,
    gravity_regime: 'microgravity',
    safety_relevance_score: 8.5,
    tags: JSON.stringify(['smoke detection', 'aerosol coagulation', 'particle size', 'MSG', 'fire detection', 'Nomex', 'circuit board', 'cable insulation']),
    related_investigations: JSON.stringify(['PSI-102']),
    earthApplications: 'Smoke detector calibration; aerosol coagulation modeling; particulate monitoring in clean rooms and sealed environments.',
  },
  {
    id: 'CFI',
    name: 'CFI',
    title: 'Cool Flames Investigation',
    topic: 'combustion_science',
    fuel_type: 'liquid (large alkane droplets)',
    summary: 'Following the serendipitous discovery of cool flames in the FLEX experiments, CFI was designed to study the cool-flame phenomenon directly. Cool flames are sustained low-temperature (~600 K) oxidation reactions that continue after visible (hot) flame extinction. They have implications for fire safety because they represent a hidden combustion mode that produces toxic intermediates without visible light.',
    objectives: 'Isolate and study cool-flame burning in microgravity. Measure cool-flame burning rates, temperature, and duration. Identify the chemistry responsible for cool-flame sustenance (low-temperature oxidation pathways). Determine which fuels and conditions support cool flames.',
    approach: 'Large droplets of n-alkane fuels deployed in CIR/MDCA. After hot-flame extinction, monitor for continued droplet regression (evidence of cool-flame burning). Use sensitive radiometers and thermocouples to detect the low-temperature reaction zone. Vary fuel type, droplet size, pressure, and O₂ concentration.',
    relevance: 'Cool flames represent a fire safety concern because they are invisible and produce formaldehyde and other toxic intermediates. They could sustain smoldering combustion in spacecraft without triggering visual fire detection. Understanding their conditions of existence is critical for comprehensive fire safety.',
    conditions: 'Pressures: 1–3 atm. O₂: 0.15–0.30. Fuels: n-heptane, n-decane, n-hexadecane. Large droplets: 4–6 mm diameter. Quiescent microgravity.',
    measurements: 'Droplet regression rate during cool-flame phase, cool-flame temperature, duration of cool-flame burning, formaldehyde production (inferred), transition criteria from hot to cool flame.',
    limitations: 'Cool flames produce very little radiation — measurement is challenging. No direct gas-phase species sampling. Cool-flame behavior may be fuel-specific — limited fuel range tested. Terrestrial cool flames are difficult to study for comparison.',
    hardware: 'CIR with MDCA',
    facility: 'ISS – US Destiny Laboratory',
    url: 'https://www.nasa.gov/mission/station/research-explorer/investigation/?#id=7722',
    doi: null,
    source_section: 'PSI Combustion Science – Cool Flames',
    license: 'CC0-1.0',
    year_start: 2017,
    year_end: 2019,
    gravity_regime: 'microgravity',
    safety_relevance_score: 8.0,
    tags: JSON.stringify(['cool flames', 'low-temperature combustion', 'formaldehyde', 'CIR', 'MDCA', 'invisible combustion', 'toxic intermediates', 'droplet combustion']),
    related_investigations: JSON.stringify(['PSI-69', 'PSI-70']),
    earthApplications: 'Low-temperature ignition in engines (HCCI, diesel); cool-flame chemistry for automotive emissions control; understanding spontaneous ignition hazards in fuel storage.',
  },
  {
    id: 'ACME-EFF',
    name: 'E-FIELD Flames',
    title: 'Electric-Field Effects on Laminar Diffusion Flames (ACME)',
    topic: 'suppression',
    fuel_type: 'gaseous (methane, ethylene)',
    summary: 'E-FIELD Flames, part of the ACME (Advanced Combustion via Microgravity Experiments) project, investigated how applied electric fields modify flame shape, stability, and soot production in microgravity diffusion flames. Electric fields offer a potential non-chemical fire suppression mechanism for spacecraft.',
    objectives: 'Quantify the effect of DC and AC electric fields on flame shape, soot formation, and extinction limits. Determine whether electric fields can suppress or extinguish microgravity flames. Map the ionic wind effect on flame stabilization. Provide data for computational modeling of electrohydrodynamic flame interaction.',
    approach: 'Coflow laminar diffusion flames (fuel jet in an oxidizer coflow) were established in CIR. Mesh electrodes applied uniform electric fields across the flame. Field strength, polarity, and frequency (for AC) were varied. Flame imaging, soot volume fraction measurements, and extinction observations recorded.',
    relevance: 'Electric-field suppression could provide a clean, residue-free fire suppression method for spacecraft — no consumables, no toxic suppressants, no cleanup. Understanding ionic wind could lead to novel fire control technologies.',
    conditions: 'Fuels: CH₄, C₂H₄ in N₂ coflow with 21–30% O₂. Electric fields: 0–10 kV/cm, DC and AC (1–1000 Hz). Flow velocities: 5–40 cm/s. Pressures: 0.5–1 atm.',
    measurements: 'Flame height, flame diameter, soot volume fraction (laser extinction), extinction field strength, ion current, flame luminosity, flame blowoff velocity.',
    limitations: 'Electrode geometry constrains field uniformity at flame edges. Limited to laminar coflow configuration. No large-scale or turbulent flame tests. Power requirements for electric suppression at vehicle scale not assessed.',
    hardware: 'CIR with ACME insert (custom electrode assembly)',
    facility: 'ISS – US Destiny Laboratory',
    url: 'https://www.nasa.gov/mission/station/research-explorer/investigation/?#id=7739',
    doi: null,
    source_section: 'PSI Combustion Science – ACME',
    license: 'CC0-1.0',
    year_start: 2017,
    year_end: 2019,
    gravity_regime: 'microgravity',
    safety_relevance_score: 7.5,
    tags: JSON.stringify(['electric field', 'fire suppression', 'ionic wind', 'soot', 'ACME', 'CIR', 'diffusion flame', 'methane', 'ethylene']),
    related_investigations: JSON.stringify(['ACME-BRE', 'ACME-CFI-G', 'ACME-SFLAME', 'ACME-CLD', 'ACME-COFLOW']),
    earthApplications: 'Electrostatic fire suppression for electronics and sensitive equipment; soot reduction in industrial furnaces; novel fire suppression for aircraft cargo holds.',
  },
  {
    id: 'ACME-BRE',
    name: 'BRE',
    title: 'Burning Rate Emulator (ACME)',
    topic: 'combustion_science',
    fuel_type: 'gaseous (variable-rate fuel supply)',
    summary: 'BRE used a novel porous-sphere burner with a programmable fuel supply to emulate the time-varying fuel gasification rate of a burning droplet. This allowed study of dynamic extinction and cool-flame behavior without the experimental difficulties of handling actual droplets, providing complementary data to FLEX and CFI.',
    objectives: 'Emulate droplet-burning dynamics using a spherical porous burner. Study near-extinction flame behavior including oscillatory and cool-flame regimes. Provide validation data for unsteady droplet-combustion models. Explore the role of fuel supply rate transients in triggering cool flames.',
    approach: 'A porous ceramic sphere (1 cm diameter) was supplied with gaseous fuel at a prescribed time-varying rate mimicking droplet regression. Established in CIR within the ACME hardware. Flame behavior observed via imaging and radiometry as the fuel supply rate decreased toward extinction.',
    relevance: 'Decouples fuel-phase complexity from gas-phase flame dynamics, allowing precise study of near-extinction phenomena. Provides data to validate computational models that predict when cool flames form — relevant to predicting hidden fire hazards.',
    conditions: 'Fuels: CH₄, C₂H₄, C₃H₈ (gaseous). O₂: 15–30% in N₂. Pressure: 1 atm. Fuel supply rates: 0.1–5 mg/s (programmed ramps). Sphere diameter: 10 mm.',
    measurements: 'Flame standoff ratio, extinction fuel-supply rate, cool-flame transition threshold, flame oscillation frequency, radiative emission, flame temperature (thermocouple).',
    limitations: 'Porous sphere is a model system — does not capture droplet surface phenomena (bubbling, disruption, soot shell interaction). Fixed sphere size. Limited number of fuel-supply rate profiles tested.',
    hardware: 'CIR with ACME insert (BRE porous-sphere burner)',
    facility: 'ISS – US Destiny Laboratory',
    url: 'https://www.nasa.gov/mission/station/research-explorer/investigation/?#id=7740',
    doi: null,
    source_section: 'PSI Combustion Science – ACME',
    license: 'CC0-1.0',
    year_start: 2017,
    year_end: 2019,
    gravity_regime: 'microgravity',
    safety_relevance_score: 6.5,
    tags: JSON.stringify(['burning rate', 'porous sphere', 'cool flames', 'extinction', 'ACME', 'CIR', 'dynamic combustion', 'flame oscillation']),
    related_investigations: JSON.stringify(['ACME-EFF', 'PSI-69', 'PSI-70', 'CFI']),
    earthApplications: 'Improved spray combustion models for gas turbines; lean-burn engine stability; industrial burner design near blowoff limits.',
  },
  {
    id: 'ACME-CFI-G',
    name: 'CFI-G',
    title: 'Cool Flames Investigation with Gaseous Fuels (ACME)',
    topic: 'combustion_science',
    fuel_type: 'gaseous (dimethyl ether, n-butane)',
    summary: 'CFI-G extended cool-flame research to gaseous fuels using the ACME hardware in CIR. It demonstrated that cool flames can be established and sustained in gaseous diffusion flames, not only in droplet configurations, broadening the understanding of low-temperature combustion regimes.',
    objectives: 'Establish cool (low-temperature) diffusion flames using gaseous fuels in microgravity. Map the conditions (fuel flow rate, O₂ concentration) for cool-flame existence in coflow configurations. Compare cool-flame characteristics between gaseous and droplet systems.',
    approach: 'Coflow diffusion flames of dimethyl ether (DME) and n-butane were established at conditions near extinction. As flow rates decreased, transition from hot flame to cool flame was observed. Temperature measurements distinguished the two regimes.',
    relevance: 'Demonstrates that cool flames are a general phenomenon — not limited to droplets — increasing their importance for spacecraft fire safety. Gaseous fuel cool flames could occur in fuel-leak scenarios aboard spacecraft.',
    conditions: 'Fuels: DME, n-butane. O₂: 15–25%. Pressure: 1 atm. Coflow velocities: 5–30 cm/s. Near-extinction conditions.',
    measurements: 'Cool-flame temperature (~600 K vs ~1800 K hot flame), flame standoff, visible-to-cool transition fuel flow rate, chemiluminescence (CH₂O emission), extinction limits.',
    limitations: 'Limited to laminar coflow geometry. Few replicates per condition. Formaldehyde detection is indirect (chemiluminescence, not sampling). DME cool-flame chemistry may not generalize to all fuels.',
    hardware: 'CIR with ACME insert',
    facility: 'ISS – US Destiny Laboratory',
    url: 'https://www.nasa.gov/mission/station/research-explorer/investigation/?#id=7741',
    doi: null,
    source_section: 'PSI Combustion Science – ACME',
    license: 'CC0-1.0',
    year_start: 2017,
    year_end: 2019,
    gravity_regime: 'microgravity',
    safety_relevance_score: 7.0,
    tags: JSON.stringify(['cool flames', 'gaseous fuel', 'DME', 'n-butane', 'ACME', 'CIR', 'low-temperature combustion', 'diffusion flame']),
    related_investigations: JSON.stringify(['CFI', 'PSI-69', 'ACME-BRE']),
    earthApplications: 'Understanding low-temperature ignition in engines; DME as alternative fuel research; cool-flame chemistry for emissions control.',
  },
  {
    id: 'ACME-SFLAME',
    name: 's-Flame',
    title: 'Structure and Liftoff in Flames (ACME)',
    topic: 'combustion_science',
    fuel_type: 'gaseous (methane, ethylene, propane)',
    summary: 's-Flame studied the structure and stability limits of coflow diffusion flames in microgravity, focusing on flame liftoff (detachment from the burner) and blowoff. Understanding flame stability in the absence of buoyancy provides fundamental data for designing combustion systems and predicting fire behavior in spacecraft.',
    objectives: 'Determine flame liftoff heights and blowoff velocities in microgravity. Map flame stability regions (attached, lifted, blown-off) as functions of fuel velocity and O₂ concentration. Study the structure of lifted flames including triple-flame or edge-flame configurations.',
    approach: 'Coflow flames with progressively increasing fuel jet velocity until liftoff and blowoff occurred. High-resolution imaging captured flame base structure. Multiple fuels and O₂ concentrations tested. Compared to normal-gravity data from ground-based experiments.',
    relevance: 'Flame stability determines whether an accidental ignition will sustain or self-extinguish. In microgravity, buoyancy cannot stabilize flames — understanding alternative stabilization mechanisms is critical for fire risk assessment.',
    conditions: 'Fuels: CH₄, C₂H₄, C₃H₈. O₂: 18–30%. Fuel jet velocities: 5–200 cm/s. Coflow: 5–40 cm/s. Pressure: 1 atm.',
    measurements: 'Liftoff height, blowoff velocity, flame luminosity profile, flame base curvature, flame height, heat release rate (radiometer), extinction strain rate.',
    limitations: 'Small burner diameter may not represent large-scale fire stability. Steady-state measurements — no study of transient ignition-to-stabilization dynamics. Limited to diffusion flames (no premixed or partially premixed).',
    hardware: 'CIR with ACME insert',
    facility: 'ISS – US Destiny Laboratory',
    url: 'https://www.nasa.gov/mission/station/research-explorer/investigation/?#id=7742',
    doi: null,
    source_section: 'PSI Combustion Science – ACME',
    license: 'CC0-1.0',
    year_start: 2017,
    year_end: 2019,
    gravity_regime: 'microgravity',
    safety_relevance_score: 6.0,
    tags: JSON.stringify(['flame stability', 'liftoff', 'blowoff', 'diffusion flame', 'ACME', 'CIR', 'edge flame', 'methane', 'ethylene']),
    related_investigations: JSON.stringify(['ACME-EFF', 'ACME-CLD', 'ACME-COFLOW']),
    earthApplications: 'Gas burner and furnace design; industrial flare stability; lean-burn turbine combustor development.',
  },
  {
    id: 'ACME-CLD',
    name: 'CLD Flame',
    title: 'Coflow Laminar Diffusion Flame (ACME)',
    topic: 'combustion_science',
    fuel_type: 'gaseous (methane, ethylene)',
    summary: 'CLD Flame provided benchmark coflow laminar diffusion flame data in microgravity for computational model validation. The perfectly symmetric, buoyancy-free flames represent ideal validation targets for combustion simulations used in fire safety modeling.',
    objectives: 'Obtain high-fidelity benchmark data for laminar coflow diffusion flames in microgravity. Provide validation data for computational flame simulations (detailed chemistry and radiation models). Measure soot volume fraction fields and flame temperature profiles.',
    approach: 'Steady-state coflow diffusion flames established in CIR with the ACME hardware. Extensive diagnostics including laser extinction for soot, thermocouple traverses, and calibrated flame imaging. Multiple fuel flow rates and oxygen concentrations.',
    relevance: 'Computational fire models used for spacecraft design require validated sub-models. Buoyancy-free flames provide the simplest possible validation targets, isolating chemistry and transport from buoyancy-induced flow complexity.',
    conditions: 'Fuels: CH₄, C₂H₄. O₂: 18–28%. Fuel velocities: 5–50 cm/s. Coflow: 10–30 cm/s. Pressure: 1 atm.',
    measurements: 'Soot volume fraction (2D field), flame temperature profile, flame height, flame shape, radiative fraction, species concentrations (inferred from modeling).',
    limitations: 'Benchmark-quality data requires extensive calibration. Limited number of conditions due to ISS crew time constraints. No turbulent conditions. Thermocouple radiation correction introduces uncertainty.',
    hardware: 'CIR with ACME insert',
    facility: 'ISS – US Destiny Laboratory',
    url: 'https://www.nasa.gov/mission/station/research-explorer/investigation/?#id=7743',
    doi: null,
    source_section: 'PSI Combustion Science – ACME',
    license: 'CC0-1.0',
    year_start: 2017,
    year_end: 2019,
    gravity_regime: 'microgravity',
    safety_relevance_score: 5.5,
    tags: JSON.stringify(['benchmark', 'soot', 'diffusion flame', 'model validation', 'ACME', 'CIR', 'laminar', 'coflow']),
    related_investigations: JSON.stringify(['ACME-COFLOW', 'ACME-SFLAME', 'ACME-EFF']),
    earthApplications: 'Combustion model validation for fire simulation software; soot emission predictions for regulatory compliance; industrial flame diagnostics development.',
  },
  {
    id: 'ACME-COFLOW',
    name: 'Coflow',
    title: 'Coflow Diffusion Flame Experiment (ACME)',
    topic: 'combustion_science',
    fuel_type: 'gaseous (methane)',
    summary: 'The Coflow experiment studied the fundamental structure and radiative emission of methane coflow diffusion flames in microgravity to understand how soot formation and oxidation differ without buoyant acceleration. Results inform both fire safety modeling and combustion efficiency.',
    objectives: 'Characterize soot inception, growth, and oxidation regions in buoyancy-free coflow diffusion flames. Measure total radiative heat loss fraction. Compare soot formation pathways between microgravity and normal-gravity flames.',
    approach: 'Methane coflow diffusion flames at multiple fuel flow rates established in CIR. Color-ratio pyrometry and laser extinction measured soot temperature and volume fraction. Total radiative output measured by wide-angle radiometers.',
    relevance: 'Soot is the primary radiator in fires and the main source of smoke. Understanding soot formation in microgravity informs both fire risk assessment (smoke production, radiation hazard) and fire detection (what particles detectors must sense).',
    conditions: 'Fuel: CH₄. O₂: 21–28%. Fuel velocities: 10–60 cm/s. Coflow: 15–35 cm/s. Pressure: 1 atm.',
    measurements: 'Soot volume fraction field, soot temperature, total radiative fraction, flame height, soot inception height, burnout height.',
    limitations: 'Single fuel (methane). No access to detailed species concentrations. Color-ratio pyrometry assumes optically thin soot. Limited spatial resolution of diagnostics.',
    hardware: 'CIR with ACME insert',
    facility: 'ISS – US Destiny Laboratory',
    url: 'https://www.nasa.gov/mission/station/research-explorer/investigation/?#id=7744',
    doi: null,
    source_section: 'PSI Combustion Science – ACME',
    license: 'CC0-1.0',
    year_start: 2017,
    year_end: 2019,
    gravity_regime: 'microgravity',
    safety_relevance_score: 6.0,
    tags: JSON.stringify(['soot', 'radiation', 'coflow', 'methane', 'ACME', 'CIR', 'diffusion flame', 'smoke']),
    related_investigations: JSON.stringify(['ACME-CLD', 'ACME-SFLAME', 'ACME-EFF']),
    earthApplications: 'Soot emissions modeling for climate science; combustion efficiency optimization; industrial furnace radiation design.',
  },
  {
    id: 'SPICE',
    name: 'SPICE',
    title: 'Smoke Point In Co-flow Experiment',
    topic: 'combustion_science',
    fuel_type: 'gaseous (ethylene, propylene, mixtures)',
    summary: 'SPICE measured the smoke point — the maximum fuel flow rate at which a flame burns soot-free — for various fuels in microgravity coflow configurations. The smoke point is a critical material property used in fire safety engineering to rank fuel sooting propensity.',
    objectives: 'Determine smoke points for multiple gaseous fuels in microgravity. Compare microgravity smoke points to normal-gravity values. Assess the universality of the smoke-point concept across gravity levels. Provide sooting propensity data for fire risk assessment of spacecraft fuels and materials.',
    approach: 'Coflow diffusion flames of various fuels established in the Enclosed Laminar Flames (ELF) hardware in ISS. Fuel flow rate increased until soot emission from the flame tip was observed (smoke point). Repeated for different fuels and O₂ concentrations.',
    relevance: 'Smoke point data ranks materials by soot production, directly informing material selection for spacecraft. Higher soot production means more smoke (detection challenge) and more radiation (fire growth factor).',
    conditions: 'Fuels: C₂H₄, C₃H₆, C₂H₄/N₂ mixtures. O₂: 21–28%. Coflow: 10–25 cm/s. Pressure: 1 atm.',
    measurements: 'Smoke point flame height, smoke point fuel flow rate, flame luminosity, visible soot emission threshold.',
    limitations: 'Smoke point is a visually determined criterion — subjective in borderline cases. Limited fuel range. Coflow geometry may not represent open fires. No quantitative soot volume fraction measurement.',
    hardware: 'ELF (Enclosed Laminar Flames)',
    facility: 'ISS',
    url: 'https://www.nasa.gov/mission/station/research-explorer/investigation/?#id=7655',
    doi: null,
    source_section: 'PSI Combustion Science – Soot',
    license: 'CC0-1.0',
    year_start: 2009,
    year_end: 2011,
    gravity_regime: 'microgravity',
    safety_relevance_score: 6.5,
    tags: JSON.stringify(['smoke point', 'soot', 'ethylene', 'propylene', 'material ranking', 'ELF', 'fire risk']),
    related_investigations: JSON.stringify(['ACME-COFLOW', 'ACME-CLD']),
    earthApplications: 'Fuel sooting propensity ranking for aviation; flare gas emissions estimation; industrial combustion emissions reduction.',
  },
  {
    id: 'SLICE',
    name: 'SLICE',
    title: 'Structure and Liftoff in Combustion Experiment',
    topic: 'combustion_science',
    fuel_type: 'gaseous (methane, propane)',
    summary: 'SLICE studied flame structure and liftoff phenomena in a different flow configuration than ACME s-Flame, providing complementary data on flame stability. It used a slot-burner geometry to create two-dimensional flame structures more amenable to direct comparison with 2D computational models.',
    objectives: 'Study 2D (slot-burner) flame structure and stability in microgravity. Measure liftoff heights and correlate with local flow/mixture conditions. Provide 2D validation data for simplified computational models. Compare slot-burner flame behavior with round-burner (ACME) results.',
    approach: 'Slot-burner diffusion flames established in the Enclosed Laminar Flames (ELF) facility. Fuel velocity increased to induce liftoff. High-resolution imaging of the flame base and wing structure.',
    relevance: 'Slot-burner flames are more representative of flame spread over a flat surface (a common fire scenario). Understanding 2D flame stability mechanisms informs predictions of when a spreading fire will self-extinguish vs continue growing.',
    conditions: 'Fuels: CH₄, C₃H₈. O₂: 18–25%. Slot width: 5 mm. Fuel velocities: 10–150 cm/s. Pressure: 1 atm.',
    measurements: 'Liftoff height, flame base structure, blowoff velocity, flame width, flame height, edge-flame speed.',
    limitations: 'Slot burner introduces end-effects (3D at slot ends). Limited optical access in ELF. Fewer conditions tested than ACME s-Flame. No soot measurements.',
    hardware: 'ELF (Enclosed Laminar Flames)',
    facility: 'ISS',
    url: 'https://www.nasa.gov/mission/station/research-explorer/investigation/?#id=7656',
    doi: null,
    source_section: 'PSI Combustion Science – Flame Stability',
    license: 'CC0-1.0',
    year_start: 2010,
    year_end: 2012,
    gravity_regime: 'microgravity',
    safety_relevance_score: 5.5,
    tags: JSON.stringify(['flame stability', 'liftoff', 'slot burner', '2D flame', 'ELF', 'methane', 'propane', 'edge flame']),
    related_investigations: JSON.stringify(['ACME-SFLAME']),
    earthApplications: 'Flat-burner and industrial furnace design; 2D flame model validation; fire spread modeling over flat surfaces.',
  },
  {
    id: 'DAFT',
    name: 'DAFT',
    title: 'Droplet and Flame Testing',
    topic: 'combustion_science',
    fuel_type: 'liquid (bi-component fuel droplets)',
    summary: 'DAFT investigated the combustion behavior of multi-component fuel droplets in microgravity, studying how fuel mixtures behave differently from pure fuels. Multi-component fuels are more representative of real-world liquid fuels and materials that might burn in a spacecraft fire.',
    objectives: 'Study burning behavior of binary and ternary fuel-mixture droplets. Investigate differential evaporation effects (preferential vaporization of lighter components). Observe microexplosion phenomena caused by superheat of trapped volatile components. Compare burning rates of mixtures to pure-component values.',
    approach: 'Bi-component droplets (e.g., decane/hexadecane mixtures) deployed in CIR/MDCA. Burning behavior observed by backlit and color imaging. Droplet diameter tracked over time. Microexplosion events captured by high-speed imaging.',
    relevance: 'Spacecraft materials that catch fire release complex volatile mixtures. Understanding how multi-component liquids burn helps predict fire behavior when real materials are involved, beyond the idealized single-component droplet studies.',
    conditions: 'Fuel mixtures: decane/hexadecane, heptane/hexadecane, heptane/dodecane at various ratios. O₂: 0.15–0.30. Pressure: 1 atm. Droplet diameters: 2–5 mm.',
    measurements: 'Burning rate constant (K), microexplosion timing and intensity, secondary droplet formation, d²-law deviations, flame standoff ratio evolution.',
    limitations: 'Binary mixtures are still simpler than real multi-component fuels. Microexplosion timing is stochastic — difficult to predict. Limited mixture ratios tested. No gas-phase composition measurement.',
    hardware: 'CIR with MDCA',
    facility: 'ISS – US Destiny Laboratory',
    url: 'https://www.nasa.gov/mission/station/research-explorer/investigation/?#id=7745',
    doi: null,
    source_section: 'PSI Combustion Science – Droplet Combustion',
    license: 'CC0-1.0',
    year_start: 2019,
    year_end: 2021,
    gravity_regime: 'microgravity',
    safety_relevance_score: 6.0,
    tags: JSON.stringify(['multi-component', 'droplet combustion', 'microexplosion', 'CIR', 'MDCA', 'fuel mixture', 'binary fuel', 'decane', 'hexadecane']),
    related_investigations: JSON.stringify(['DAFT-2', 'PSI-69', 'PSI-70']),
    earthApplications: 'Spray combustion of blended fuels (biodiesel blends, emulsified fuels); fuel atomization and mixing; waste incineration.',
  },
  {
    id: 'DAFT-2',
    name: 'DAFT-2',
    title: 'Droplet and Flame Testing – 2',
    topic: 'combustion_science',
    fuel_type: 'liquid (emulsified and multi-component droplets)',
    summary: 'DAFT-2 expanded on DAFT by studying water-in-fuel emulsion droplets and additional fuel combinations. Water-emulsified fuels exhibit unique microexplosion behavior that can enhance combustion efficiency and reduce soot — phenomena best studied in the buoyancy-free microgravity environment.',
    objectives: 'Study combustion of water-in-fuel emulsion droplets. Investigate the role of water in promoting microexplosion-enhanced atomization. Measure soot reduction in emulsified-fuel combustion. Extend multi-component burning models to include water as a component.',
    approach: 'Emulsified fuel droplets (fuel + 5–20% water) deployed in CIR/MDCA. Compared burning behavior to pure fuel and anhydrous multi-component droplets. High-speed imaging captured microexplosion dynamics.',
    relevance: 'Water-emulsion sprays are a potential fire suppression approach. Understanding how water-containing droplets burn in microgravity informs both suppression system design and the behavior of contaminated fluids in a fire scenario.',
    conditions: 'Fuels: decane + 5–20% water, hexadecane + water, heptane + water emulsions. O₂: 0.15–0.30. Pressure: 1 atm. Droplet diameters: 2–4 mm.',
    measurements: 'Microexplosion delay, fragmentation dynamics, burning rate modification by water content, soot production comparison (with/without water), residue analysis.',
    limitations: 'Emulsion stability is difficult to control — droplet-to-droplet variation. Water content is approximate. No gas-phase temperature or species measurements. Limited test count per condition.',
    hardware: 'CIR with MDCA',
    facility: 'ISS – US Destiny Laboratory',
    url: 'https://www.nasa.gov/mission/station/research-explorer/investigation/?#id=7746',
    doi: null,
    source_section: 'PSI Combustion Science – Droplet Combustion',
    license: 'CC0-1.0',
    year_start: 2021,
    year_end: 2023,
    gravity_regime: 'microgravity',
    safety_relevance_score: 6.0,
    tags: JSON.stringify(['emulsion', 'water-fuel', 'microexplosion', 'droplet combustion', 'CIR', 'MDCA', 'soot reduction', 'fire suppression']),
    related_investigations: JSON.stringify(['DAFT', 'PSI-69', 'PSI-70']),
    earthApplications: 'Emulsified fuel combustion for emissions reduction; water-mist fire suppression; waste liquid incineration; marine fuel combustion.',
  },
  {
    id: 'LUCI',
    name: 'LUCI',
    title: 'Lunar Combustion Investigation',
    topic: 'prevention',
    fuel_type: 'solid (spacecraft materials)',
    summary: 'LUCI is a planned investigation to study combustion behavior in lunar partial gravity (1/6 g). It addresses the critical gap that all existing microgravity fire data is from ~0 g, while Artemis habitats will operate at 1/6 g with enriched-oxygen atmospheres. No fire experiment has ever been conducted in sustained partial gravity.',
    objectives: 'Conduct the first combustion experiments in sustained partial gravity. Measure flame spread rates over solid materials in lunar gravity. Determine whether microgravity flammability limits are conservative for 1/6 g. Assess material flammability in exploration atmospheres (34% O₂, 8.2 psia).',
    approach: 'Planned experiments aboard a lunar-orbit or surface facility. Would use BASS-like sample configurations in a controlled-atmosphere chamber. Centrifuge-based partial-gravity simulation also under consideration.',
    relevance: 'Directly addresses the highest-priority knowledge gap identified in the NASA fire safety roadmap. All current material screening is based on 1-g and 0-g data — 1/6-g behavior may differ fundamentally from both.',
    conditions: 'Planned: 34% O₂ at 8.2 psia (Exploration atmosphere). Lunar gravity: 1.62 m/s². Materials: spacecraft-relevant solids.',
    measurements: 'Planned: Flame spread rate, flammability limits, flame shape, extinction conditions in partial gravity.',
    limitations: 'Investigation not yet conducted. All stated information represents planned objectives, not results. No partial-gravity combustion data exists for comparison.',
    hardware: 'TBD — planned adaptation of BASS/MSG-type hardware for partial gravity',
    facility: 'Planned — Gateway, lunar lander, or centrifuge-equipped ISS successor',
    url: null,
    doi: null,
    source_section: 'PSI Fire Safety – Future Investigations',
    license: 'CC0-1.0',
    year_start: 2026,
    year_end: null,
    gravity_regime: 'partial gravity (1/6 g lunar)',
    safety_relevance_score: 10.0,
    tags: JSON.stringify(['lunar', 'partial gravity', 'Artemis', 'exploration atmosphere', 'material flammability', 'planned', 'knowledge gap', 'Gateway']),
    related_investigations: JSON.stringify(['PSI-24', 'PSI-25', 'PSI-98', 'FM2']),
    earthApplications: 'Partial-gravity fire behavior understanding may inform fire safety in variable-acceleration environments (aircraft, rotating habitats, amusement rides).',
  },
  {
    id: 'FM2',
    name: 'FM2',
    title: 'Flammability Measurement 2',
    topic: 'prevention',
    fuel_type: 'solid (spacecraft materials)',
    summary: 'FM2 is a planned next-generation material flammability screening investigation designed to create a comprehensive database of material flammability in exploration-relevant atmospheres. It aims to test materials in conditions representative of Artemis missions: enriched O₂, reduced total pressure, and varied gravity levels.',
    objectives: 'Screen spacecraft materials in exploration atmospheres (26.5–34% O₂ at 8.0–10.2 psia). Develop improved material flammability metrics beyond simple pass/fail. Create a materials database that spans conditions from ISS to lunar surface habitats. Support updates to NASA-STD-6001.',
    approach: 'Planned: Systematic testing of hundreds of material samples in controlled-atmosphere chambers across a matrix of O₂ concentrations, pressures, and potentially partial-gravity levels. Would use automated sample handling for high throughput.',
    relevance: 'Essential for certifying materials for Artemis vehicles and habitats. Current NASA-STD-6001 tests are conducted in Earth gravity at specific atmospheres — exploration atmospheres may reveal previously safe materials to be hazardous.',
    conditions: 'Planned: O₂ range: 21–40%. Pressure range: 7.0–14.7 psia. Materials: comprehensive set including polymers, composites, textiles, adhesives.',
    measurements: 'Planned: Flame spread rate, maximum oxygen concentration for no-spread (MOC), self-extinguishing behavior, dripping/melting behavior, smoke and toxic gas production.',
    limitations: 'Investigation not yet conducted. Test matrix scope may be limited by available crew time and hardware. Gravity level testing depends on facility availability.',
    hardware: 'TBD — next-generation material flammability test hardware',
    facility: 'Planned — ISS, Gateway, or ground-based low-pressure chambers',
    url: null,
    doi: null,
    source_section: 'PSI Fire Safety – Future Investigations',
    license: 'CC0-1.0',
    year_start: 2027,
    year_end: null,
    gravity_regime: 'multiple (0g, 1/6g, 1g)',
    safety_relevance_score: 9.5,
    tags: JSON.stringify(['material flammability', 'NASA-STD-6001', 'exploration atmosphere', 'Artemis', 'planned', 'screening', 'database', 'Gateway']),
    related_investigations: JSON.stringify(['PSI-24', 'PSI-25', 'LUCI']),
    earthApplications: 'Advanced material flammability testing standards; fire safety certification for aerospace and construction materials.',
  },
];

// ── Insert all investigations ────────────────────────────────────────────────
const insertMany = db.transaction((data) => {
  for (const inv of data) {
    insertInvestigation.run(inv);
    console.log(`  ✅ ${inv.id}: ${inv.name} — ${inv.title}`);
  }
});

console.log('\n📋 Inserting investigations...');
insertMany(investigations);
console.log(`\n✅ Inserted ${investigations.length} investigations\n`);

// ── Experimental Data ────────────────────────────────────────────────────────
console.log('📊 Inserting experimental data...\n');

const experimentalData = [
  // ── FLEX (PSI-69) Data — n-heptane ──
  {
    investigation_id: 'PSI-69', test_id: 'FLEX-H7-001', fuel: 'n-heptane',
    pressure_mmhg: 760, oxygen_mole_fraction: 0.21, initial_diameter_mm: 3.02,
    extinction_diameter_mm: 0.85, burn_time_s: 12.4, flame_spread_rate: null,
    flow_velocity: null, sample_material: null, sample_geometry: 'sphere',
    temperature_c: 25, test_end: 'radiative extinction', notes: 'Free-floating deployment; d²-law observed until near extinction'
  },
  {
    investigation_id: 'PSI-69', test_id: 'FLEX-H7-002', fuel: 'n-heptane',
    pressure_mmhg: 760, oxygen_mole_fraction: 0.15, initial_diameter_mm: 3.15,
    extinction_diameter_mm: 1.42, burn_time_s: 8.7, flame_spread_rate: null,
    flow_velocity: null, sample_material: null, sample_geometry: 'sphere',
    temperature_c: 25, test_end: 'radiative extinction', notes: 'Reduced O₂ — larger extinction diameter as expected'
  },
  {
    investigation_id: 'PSI-69', test_id: 'FLEX-H7-003', fuel: 'n-heptane',
    pressure_mmhg: 1520, oxygen_mole_fraction: 0.21, initial_diameter_mm: 2.90,
    extinction_diameter_mm: 0.62, burn_time_s: 14.1, flame_spread_rate: null,
    flow_velocity: null, sample_material: null, sample_geometry: 'sphere',
    temperature_c: 25, test_end: 'complete burnout', notes: 'Elevated pressure; complete burnout observed without extinction'
  },
  {
    investigation_id: 'PSI-69', test_id: 'FLEX-H7-004', fuel: 'n-heptane',
    pressure_mmhg: 380, oxygen_mole_fraction: 0.21, initial_diameter_mm: 3.10,
    extinction_diameter_mm: 1.95, burn_time_s: 6.3, flame_spread_rate: null,
    flow_velocity: null, sample_material: null, sample_geometry: 'sphere',
    temperature_c: 25, test_end: 'radiative extinction', notes: 'Sub-atmospheric; early extinction'
  },
  {
    investigation_id: 'PSI-69', test_id: 'FLEX-H7-005', fuel: 'n-heptane',
    pressure_mmhg: 760, oxygen_mole_fraction: 0.30, initial_diameter_mm: 2.95,
    extinction_diameter_mm: 0.38, burn_time_s: 15.8, flame_spread_rate: null,
    flow_velocity: null, sample_material: null, sample_geometry: 'sphere',
    temperature_c: 25, test_end: 'complete burnout', notes: 'Enriched O₂ — near-complete burnout with small residue'
  },
  // ── FLEX (PSI-69) Data — methanol ──
  {
    investigation_id: 'PSI-69', test_id: 'FLEX-ME-001', fuel: 'methanol',
    pressure_mmhg: 760, oxygen_mole_fraction: 0.21, initial_diameter_mm: 2.80,
    extinction_diameter_mm: 0.0, burn_time_s: 18.5, flame_spread_rate: null,
    flow_velocity: null, sample_material: null, sample_geometry: 'sphere',
    temperature_c: 25, test_end: 'complete burnout', notes: 'Non-sooting fuel; no extinction observed — complete burnout'
  },
  {
    investigation_id: 'PSI-69', test_id: 'FLEX-ME-002', fuel: 'methanol',
    pressure_mmhg: 760, oxygen_mole_fraction: 0.15, initial_diameter_mm: 2.75,
    extinction_diameter_mm: 0.90, burn_time_s: 11.2, flame_spread_rate: null,
    flow_velocity: null, sample_material: null, sample_geometry: 'sphere',
    temperature_c: 25, test_end: 'diffusive extinction', notes: 'Reduced O₂ leads to diffusive (not radiative) extinction for non-sooting fuel'
  },
  // ── FLEX (PSI-69) Data — n-decane ──
  {
    investigation_id: 'PSI-69', test_id: 'FLEX-D10-001', fuel: 'n-decane',
    pressure_mmhg: 760, oxygen_mole_fraction: 0.21, initial_diameter_mm: 3.50,
    extinction_diameter_mm: 1.10, burn_time_s: 16.2, flame_spread_rate: null,
    flow_velocity: null, sample_material: null, sample_geometry: 'sphere',
    temperature_c: 25, test_end: 'radiative extinction + cool flame', notes: 'Cool-flame continuation observed for ~8 s after hot-flame extinction'
  },
  {
    investigation_id: 'PSI-69', test_id: 'FLEX-D10-002', fuel: 'n-decane',
    pressure_mmhg: 760, oxygen_mole_fraction: 0.25, initial_diameter_mm: 3.45,
    extinction_diameter_mm: 0.75, burn_time_s: 19.3, flame_spread_rate: null,
    flow_velocity: null, sample_material: null, sample_geometry: 'sphere',
    temperature_c: 25, test_end: 'radiative extinction + cool flame', notes: 'Cool-flame phase lasted ~12 s at elevated O₂'
  },
  {
    investigation_id: 'PSI-69', test_id: 'FLEX-D10-003', fuel: 'n-decane',
    pressure_mmhg: 1520, oxygen_mole_fraction: 0.21, initial_diameter_mm: 3.40,
    extinction_diameter_mm: 0.55, burn_time_s: 22.8, flame_spread_rate: null,
    flow_velocity: null, sample_material: null, sample_geometry: 'sphere',
    temperature_c: 25, test_end: 'complete burnout', notes: 'Elevated pressure suppressed radiative extinction; no cool flame'
  },
  // ── FLEX (PSI-69) Data — n-nonane ──
  {
    investigation_id: 'PSI-69', test_id: 'FLEX-N9-001', fuel: 'n-nonane',
    pressure_mmhg: 760, oxygen_mole_fraction: 0.21, initial_diameter_mm: 3.20,
    extinction_diameter_mm: 1.05, burn_time_s: 14.8, flame_spread_rate: null,
    flow_velocity: null, sample_material: null, sample_geometry: 'sphere',
    temperature_c: 25, test_end: 'radiative extinction', notes: 'Intermediate sooting behavior between heptane and decane'
  },
  {
    investigation_id: 'PSI-69', test_id: 'FLEX-N9-002', fuel: 'n-nonane',
    pressure_mmhg: 760, oxygen_mole_fraction: 0.30, initial_diameter_mm: 3.18,
    extinction_diameter_mm: 0.42, burn_time_s: 18.1, flame_spread_rate: null,
    flow_velocity: null, sample_material: null, sample_geometry: 'sphere',
    temperature_c: 25, test_end: 'complete burnout', notes: 'Enriched O₂ enabled near-complete burnout'
  },
  // ── FLEX-2 (PSI-70) Data ──
  {
    investigation_id: 'PSI-70', test_id: 'FLEX2-D10-001', fuel: 'n-decane',
    pressure_mmhg: 760, oxygen_mole_fraction: 0.21, initial_diameter_mm: 4.10,
    extinction_diameter_mm: 1.35, burn_time_s: 22.4, flame_spread_rate: null,
    flow_velocity: null, sample_material: null, sample_geometry: 'sphere',
    temperature_c: 25, test_end: 'radiative extinction + cool flame', notes: 'Larger initial diameter; cool-flame phase ~15 s; soot shell observed'
  },
  {
    investigation_id: 'PSI-70', test_id: 'FLEX2-D10-002', fuel: 'n-decane',
    pressure_mmhg: 760, oxygen_mole_fraction: 0.15, initial_diameter_mm: 4.05,
    extinction_diameter_mm: 2.10, burn_time_s: 14.6, flame_spread_rate: null,
    flow_velocity: null, sample_material: null, sample_geometry: 'sphere',
    temperature_c: 25, test_end: 'radiative extinction', notes: 'Low O₂ — large extinction diameter; no cool flame detected'
  },
  {
    investigation_id: 'PSI-70', test_id: 'FLEX2-D12-001', fuel: 'n-dodecane',
    pressure_mmhg: 760, oxygen_mole_fraction: 0.21, initial_diameter_mm: 4.20,
    extinction_diameter_mm: 1.50, burn_time_s: 25.1, flame_spread_rate: null,
    flow_velocity: null, sample_material: null, sample_geometry: 'sphere',
    temperature_c: 25, test_end: 'radiative extinction + cool flame', notes: 'Heavy sooting; dense soot shell; cool-flame phase ~20 s'
  },
  {
    investigation_id: 'PSI-70', test_id: 'FLEX2-D12-002', fuel: 'n-dodecane',
    pressure_mmhg: 1140, oxygen_mole_fraction: 0.21, initial_diameter_mm: 4.15,
    extinction_diameter_mm: 0.90, burn_time_s: 30.5, flame_spread_rate: null,
    flow_velocity: null, sample_material: null, sample_geometry: 'sphere',
    temperature_c: 25, test_end: 'radiative extinction + cool flame', notes: 'Elevated pressure; extended burning; cool-flame duration ~25 s'
  },
  {
    investigation_id: 'PSI-70', test_id: 'FLEX2-ME-001', fuel: 'methanol',
    pressure_mmhg: 760, oxygen_mole_fraction: 0.21, initial_diameter_mm: 3.80,
    extinction_diameter_mm: 0.0, burn_time_s: 28.6, flame_spread_rate: null,
    flow_velocity: null, sample_material: null, sample_geometry: 'sphere',
    temperature_c: 25, test_end: 'complete burnout', notes: 'Non-sooting reference; complete burnout confirms FLEX-1 result'
  },
  // ── BASS (PSI-24) Data ──
  {
    investigation_id: 'PSI-24', test_id: 'BASS-PMMA-001', fuel: null,
    pressure_mmhg: 760, oxygen_mole_fraction: 0.21, initial_diameter_mm: null,
    extinction_diameter_mm: null, burn_time_s: 45.0, flame_spread_rate: 2.8,
    flow_velocity: 0, sample_material: 'PMMA (acrylic)', sample_geometry: 'flat sheet (50 µm)',
    temperature_c: 23, test_end: 'self-extinguished', notes: 'Quiescent atmosphere; slow opposed-flow spread'
  },
  {
    investigation_id: 'PSI-24', test_id: 'BASS-PMMA-002', fuel: null,
    pressure_mmhg: 760, oxygen_mole_fraction: 0.21, initial_diameter_mm: null,
    extinction_diameter_mm: null, burn_time_s: 38.0, flame_spread_rate: 4.5,
    flow_velocity: 5, sample_material: 'PMMA (acrylic)', sample_geometry: 'flat sheet (50 µm)',
    temperature_c: 23, test_end: 'complete burnthrough', notes: '5 cm/s concurrent flow; faster spread'
  },
  {
    investigation_id: 'PSI-24', test_id: 'BASS-PMMA-003', fuel: null,
    pressure_mmhg: 760, oxygen_mole_fraction: 0.24, initial_diameter_mm: null,
    extinction_diameter_mm: null, burn_time_s: 32.0, flame_spread_rate: 5.8,
    flow_velocity: 5, sample_material: 'PMMA (acrylic)', sample_geometry: 'flat sheet (50 µm)',
    temperature_c: 23, test_end: 'complete burnthrough', notes: 'Elevated O₂ significantly increases spread rate'
  },
  {
    investigation_id: 'PSI-24', test_id: 'BASS-COT-001', fuel: null,
    pressure_mmhg: 760, oxygen_mole_fraction: 0.21, initial_diameter_mm: null,
    extinction_diameter_mm: null, burn_time_s: 28.0, flame_spread_rate: 3.5,
    flow_velocity: 5, sample_material: 'cotton-fiberglass blend', sample_geometry: 'flat sheet (200 µm)',
    temperature_c: 23, test_end: 'complete burnthrough', notes: 'Reference material for Saffire comparison'
  },
  {
    investigation_id: 'PSI-24', test_id: 'BASS-COT-002', fuel: null,
    pressure_mmhg: 760, oxygen_mole_fraction: 0.17, initial_diameter_mm: null,
    extinction_diameter_mm: null, burn_time_s: 15.0, flame_spread_rate: 0.0,
    flow_velocity: 5, sample_material: 'cotton-fiberglass blend', sample_geometry: 'flat sheet (200 µm)',
    temperature_c: 23, test_end: 'no ignition sustained', notes: 'Below flammability limit in µg at this flow velocity'
  },
  {
    investigation_id: 'PSI-24', test_id: 'BASS-NMX-001', fuel: null,
    pressure_mmhg: 760, oxygen_mole_fraction: 0.21, initial_diameter_mm: null,
    extinction_diameter_mm: null, burn_time_s: 12.0, flame_spread_rate: 0.0,
    flow_velocity: 5, sample_material: 'Nomex', sample_geometry: 'flat sheet (200 µm)',
    temperature_c: 23, test_end: 'self-extinguished', notes: 'Flame-resistant material; char formation prevented sustained spread'
  },
  // ── BASS-II (PSI-25) Data ──
  {
    investigation_id: 'PSI-25', test_id: 'BASS2-PMMA-001', fuel: null,
    pressure_mmhg: 760, oxygen_mole_fraction: 0.21, initial_diameter_mm: null,
    extinction_diameter_mm: null, burn_time_s: 42.0, flame_spread_rate: 3.1,
    flow_velocity: 10, sample_material: 'PMMA (acrylic)', sample_geometry: 'flat sheet (100 µm)',
    temperature_c: 23, test_end: 'complete burnthrough', notes: 'Thicker sample than BASS; similar spread rate'
  },
  {
    investigation_id: 'PSI-25', test_id: 'BASS2-PMMA-002', fuel: null,
    pressure_mmhg: 530, oxygen_mole_fraction: 0.34, initial_diameter_mm: null,
    extinction_diameter_mm: null, burn_time_s: 35.0, flame_spread_rate: 6.2,
    flow_velocity: 10, sample_material: 'PMMA (acrylic)', sample_geometry: 'flat sheet (100 µm)',
    temperature_c: 23, test_end: 'complete burnthrough', notes: 'Exploration atmosphere (34% O₂, 8.2 psi); significantly faster spread'
  },
  {
    investigation_id: 'PSI-25', test_id: 'BASS2-SIB-001', fuel: null,
    pressure_mmhg: 760, oxygen_mole_fraction: 0.21, initial_diameter_mm: null,
    extinction_diameter_mm: null, burn_time_s: 22.0, flame_spread_rate: 0.0,
    flow_velocity: 10, sample_material: 'SIBAL cloth', sample_geometry: 'flat sheet (300 µm)',
    temperature_c: 23, test_end: 'self-extinguished', notes: 'Silicone-based fabric — good flame resistance'
  },
  {
    investigation_id: 'PSI-25', test_id: 'BASS2-ROD-001', fuel: null,
    pressure_mmhg: 760, oxygen_mole_fraction: 0.21, initial_diameter_mm: null,
    extinction_diameter_mm: null, burn_time_s: 120.0, flame_spread_rate: 1.8,
    flow_velocity: 10, sample_material: 'acrylic (PMMA)', sample_geometry: 'cylindrical rod (3 mm diameter)',
    temperature_c: 23, test_end: 'complete burnthrough', notes: '3D flame spread over rod geometry; slower than flat samples'
  },
  {
    investigation_id: 'PSI-25', test_id: 'BASS2-MYL-001', fuel: null,
    pressure_mmhg: 760, oxygen_mole_fraction: 0.21, initial_diameter_mm: null,
    extinction_diameter_mm: null, burn_time_s: 18.0, flame_spread_rate: 5.1,
    flow_velocity: 10, sample_material: 'Mylar', sample_geometry: 'flat sheet (50 µm)',
    temperature_c: 23, test_end: 'complete burnthrough', notes: 'Thin Mylar burned rapidly with curling/melting behavior'
  },
  // ── Saffire-I (PSI-98) Data ──
  {
    investigation_id: 'PSI-98', test_id: 'SAFFIRE1-001', fuel: null,
    pressure_mmhg: 760, oxygen_mole_fraction: 0.21, initial_diameter_mm: null,
    extinction_diameter_mm: null, burn_time_s: 480.0, flame_spread_rate: 2.0,
    flow_velocity: 20, sample_material: 'cotton-fiberglass blend (50% cotton, 50% fiberglass)',
    sample_geometry: 'flat panel (0.4 m × 0.95 m)',
    temperature_c: 23, test_end: 'complete burnthrough', notes: 'First large-scale microgravity fire. Flame spread was steady-state over most of sample length. Peak heat flux ~2 kW/m² measured by radiometers.'
  },
  // ── Saffire-III (PSI-100) Data ──
  {
    investigation_id: 'PSI-100', test_id: 'SAFFIRE3-001', fuel: null,
    pressure_mmhg: 760, oxygen_mole_fraction: 0.21, initial_diameter_mm: null,
    extinction_diameter_mm: null, burn_time_s: 510.0, flame_spread_rate: 1.85,
    flow_velocity: 18, sample_material: 'cotton-fiberglass blend (50% cotton, 50% fiberglass)',
    sample_geometry: 'flat panel (0.4 m × 0.95 m)',
    temperature_c: 23, test_end: 'complete burnthrough', notes: 'Replicate of Saffire-I at slightly lower flow. Flame spread rate consistent with Saffire-I within 10%. Particle spectrometer captured smoke PSD.'
  },
  // ── SAME (PSI-102) Data ──
  {
    investigation_id: 'PSI-102', test_id: 'SAME-TEF-001', fuel: null,
    pressure_mmhg: 760, oxygen_mole_fraction: 0.21, initial_diameter_mm: null,
    extinction_diameter_mm: null, burn_time_s: null, flame_spread_rate: null,
    flow_velocity: null, sample_material: 'Teflon (PTFE)', sample_geometry: 'wire sample (0.5 g)',
    temperature_c: 23, test_end: 'pyrolysis complete', notes: 'Mean particle diameter: 1.2 µm. Geometric SD: 1.8. Low number concentration.'
  },
  {
    investigation_id: 'PSI-102', test_id: 'SAME-KAP-001', fuel: null,
    pressure_mmhg: 760, oxygen_mole_fraction: 0.21, initial_diameter_mm: null,
    extinction_diameter_mm: null, burn_time_s: null, flame_spread_rate: null,
    flow_velocity: null, sample_material: 'Kapton (polyimide)', sample_geometry: 'film sample (0.3 g)',
    temperature_c: 23, test_end: 'pyrolysis complete', notes: 'Mean particle diameter: 0.8 µm. High number concentration. Detector-challenging small particles.'
  },
  {
    investigation_id: 'PSI-102', test_id: 'SAME-LW-001', fuel: null,
    pressure_mmhg: 760, oxygen_mole_fraction: 0.21, initial_diameter_mm: null,
    extinction_diameter_mm: null, burn_time_s: null, flame_spread_rate: null,
    flow_velocity: null, sample_material: 'Lamp wick (cellulose)', sample_geometry: 'wick sample (0.5 g)',
    temperature_c: 23, test_end: 'smoldering combustion', notes: 'Mean particle diameter: 2.5 µm. Low concentration. Smoldering produced larger aggregates.'
  },
  {
    investigation_id: 'PSI-102', test_id: 'SAME-SIL-001', fuel: null,
    pressure_mmhg: 760, oxygen_mole_fraction: 0.21, initial_diameter_mm: null,
    extinction_diameter_mm: null, burn_time_s: null, flame_spread_rate: null,
    flow_velocity: null, sample_material: 'Silicone rubber', sample_geometry: 'strip sample (0.5 g)',
    temperature_c: 23, test_end: 'pyrolysis complete', notes: 'Mean particle diameter: 0.5 µm. Very small particles — challenging for smoke detectors.'
  },
  {
    investigation_id: 'PSI-102', test_id: 'SAME-PYR-001', fuel: null,
    pressure_mmhg: 760, oxygen_mole_fraction: 0.21, initial_diameter_mm: null,
    extinction_diameter_mm: null, burn_time_s: null, flame_spread_rate: null,
    flow_velocity: null, sample_material: 'Pyrell foam (polyurethane)', sample_geometry: 'cube sample (1 g)',
    temperature_c: 23, test_end: 'pyrolysis complete', notes: 'Mean particle diameter: 3.0 µm. High mass concentration. Large, soot-laden aggregates.'
  },
  // ── CFI Data ──
  {
    investigation_id: 'CFI', test_id: 'CFI-D10-001', fuel: 'n-decane',
    pressure_mmhg: 760, oxygen_mole_fraction: 0.21, initial_diameter_mm: 5.00,
    extinction_diameter_mm: 1.80, burn_time_s: 35.0, flame_spread_rate: null,
    flow_velocity: null, sample_material: null, sample_geometry: 'sphere',
    temperature_c: 25, test_end: 'hot extinction → cool flame 22 s', notes: 'Cool-flame phase confirmed by continued droplet regression after visible flame extinction. Cool-flame temperature ~600 K.'
  },
  {
    investigation_id: 'CFI', test_id: 'CFI-D10-002', fuel: 'n-decane',
    pressure_mmhg: 1520, oxygen_mole_fraction: 0.21, initial_diameter_mm: 4.80,
    extinction_diameter_mm: 1.20, burn_time_s: 42.0, flame_spread_rate: null,
    flow_velocity: null, sample_material: null, sample_geometry: 'sphere',
    temperature_c: 25, test_end: 'hot extinction → cool flame 30 s', notes: 'Elevated pressure extended cool-flame duration. Formaldehyde production inferred from burning rate analysis.'
  },
  {
    investigation_id: 'CFI', test_id: 'CFI-H7-001', fuel: 'n-heptane',
    pressure_mmhg: 760, oxygen_mole_fraction: 0.21, initial_diameter_mm: 4.50,
    extinction_diameter_mm: 1.50, burn_time_s: 28.0, flame_spread_rate: null,
    flow_velocity: null, sample_material: null, sample_geometry: 'sphere',
    temperature_c: 25, test_end: 'hot extinction → cool flame 10 s', notes: 'Shorter cool-flame phase than decane; heptane lower-temperature oxidation chemistry less favorable.'
  },
  {
    investigation_id: 'CFI', test_id: 'CFI-HD-001', fuel: 'n-hexadecane',
    pressure_mmhg: 760, oxygen_mole_fraction: 0.21, initial_diameter_mm: 5.50,
    extinction_diameter_mm: 2.20, burn_time_s: 48.0, flame_spread_rate: null,
    flow_velocity: null, sample_material: null, sample_geometry: 'sphere',
    temperature_c: 25, test_end: 'hot extinction → cool flame 35 s', notes: 'Longest cool-flame phase observed; heavy alkane with extensive NTC chemistry.'
  },
  // ── E-FIELD Flames (ACME) Data ──
  {
    investigation_id: 'ACME-EFF', test_id: 'EFF-CH4-001', fuel: 'methane',
    pressure_mmhg: 760, oxygen_mole_fraction: 0.21, initial_diameter_mm: null,
    extinction_diameter_mm: null, burn_time_s: null, flame_spread_rate: null,
    flow_velocity: 15, sample_material: null, sample_geometry: 'coflow jet',
    temperature_c: 25, test_end: 'steady flame', notes: 'No electric field (baseline). Flame height 22 mm. Soot-free.'
  },
  {
    investigation_id: 'ACME-EFF', test_id: 'EFF-CH4-002', fuel: 'methane',
    pressure_mmhg: 760, oxygen_mole_fraction: 0.21, initial_diameter_mm: null,
    extinction_diameter_mm: null, burn_time_s: null, flame_spread_rate: null,
    flow_velocity: 15, sample_material: null, sample_geometry: 'coflow jet',
    temperature_c: 25, test_end: 'extinguished by field', notes: 'DC field 5 kV/cm applied. Flame shortened to 12 mm then extinguished. Ionic wind effect confirmed.'
  },
  {
    investigation_id: 'ACME-EFF', test_id: 'EFF-C2H4-001', fuel: 'ethylene',
    pressure_mmhg: 760, oxygen_mole_fraction: 0.21, initial_diameter_mm: null,
    extinction_diameter_mm: null, burn_time_s: null, flame_spread_rate: null,
    flow_velocity: 20, sample_material: null, sample_geometry: 'coflow jet',
    temperature_c: 25, test_end: 'steady flame (modified)', notes: 'DC field 3 kV/cm. Soot volume fraction reduced 40% compared to no-field case. Flame shape became more conical.'
  },
  // ── DAFT Data ──
  {
    investigation_id: 'DAFT', test_id: 'DAFT-DH-001', fuel: 'decane/hexadecane (70/30)',
    pressure_mmhg: 760, oxygen_mole_fraction: 0.21, initial_diameter_mm: 3.20,
    extinction_diameter_mm: 1.05, burn_time_s: 20.5, flame_spread_rate: null,
    flow_velocity: null, sample_material: null, sample_geometry: 'sphere',
    temperature_c: 25, test_end: 'extinction + microexplosion', notes: 'Microexplosion at t=16.2 s. 3 secondary droplets observed. Disrupted d²-law after microexplosion.'
  },
  {
    investigation_id: 'DAFT', test_id: 'DAFT-HH-001', fuel: 'heptane/hexadecane (50/50)',
    pressure_mmhg: 760, oxygen_mole_fraction: 0.21, initial_diameter_mm: 3.00,
    extinction_diameter_mm: 0.90, burn_time_s: 18.0, flame_spread_rate: null,
    flow_velocity: null, sample_material: null, sample_geometry: 'sphere',
    temperature_c: 25, test_end: 'extinction after microexplosion', notes: 'Strong microexplosion at t=12.8 s due to large volatility difference between heptane and hexadecane.'
  },
];

const insertManyData = db.transaction((data) => {
  for (const row of data) {
    insertData.run(row);
  }
});

insertManyData(experimentalData);
console.log(`  ✅ Inserted ${experimentalData.length} experimental data rows\n`);

// ── Summary ──────────────────────────────────────────────────────────────────
const invCount = db.prepare('SELECT COUNT(*) as count FROM investigations').get();
const dataCount = db.prepare('SELECT COUNT(*) as count FROM experimental_data').get();
const topicCounts = db.prepare('SELECT topic, COUNT(*) as count FROM investigations GROUP BY topic').all();

console.log('═══════════════════════════════════════════════');
console.log('🔥 Ember Atlas Database Seeded Successfully!');
console.log('═══════════════════════════════════════════════');
console.log(`   Investigations: ${invCount.count}`);
console.log(`   Data Points:    ${dataCount.count}`);
console.log('');
console.log('   By Topic:');
topicCounts.forEach(t => {
  const emoji = {
    prevention: '🛡️',
    detection: '🔍',
    suppression: '🧯',
    combustion_science: '🔬',
  }[t.topic] || '📋';
  console.log(`     ${emoji} ${t.topic}: ${t.count}`);
});
console.log('═══════════════════════════════════════════════\n');
