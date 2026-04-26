# Detailed Report: All Parameters Used to Derive Solution

## Overview
This report provides a comprehensive breakdown of all parameters, configurations, and calculations used in deriving the feasibility solution. The system is designed to calculate various aspects of building design including GFA (Gross Floor Area), BUA (Built-Up Area), parking requirements, lift calculations, and more.

## 1. Input Parameters

### 1.1 Basic Configuration Parameters
- **Allowed GFA**: Maximum Gross Floor Area permitted by regulations
- **Number of Basement Levels**: Count of basement floors
- **Number of Podium Levels**: Count of podium floors
- **Number of Typical Floors**: Count of standard residential floors
- **Number of Hotel Floors**: Count of hotel floors (if applicable)
- **Number of Retail Floors**: Count of retail floors
- **Number of Office Floors**: Count of office floors
- **Number of Commercial Floors**: Count of commercial floors
- **Number of Mezzanine Floors**: Count of mezzanine floors
- **Number of Warehouse Floors**: Count of warehouse floors

### 1.2 Project-Specific Parameters

#### Residential Projects
- **Apartment Mix**: Distribution of unit types (Studio, 1BHK, 2BHK, 3BHK, etc.)
- **Balcony Placement**: Options include recessed or protruding
- **Corridor Type**: Single-loaded or double-loaded corridors
- **Calculation Mode**: Standard or offset-based calculation

#### Hotel Projects
- **Room Mix**: Distribution of standard keys vs. suite keys
- **Specialized Areas**: Restaurant, ballroom, meeting rooms

#### School Projects
- **Classroom Count**: Number of classrooms for different grade levels
- **Administrative Area**: Size of administrative spaces
- **Play Areas**: Requirements for outdoor and covered play areas

#### Labour Camp Projects
- **Labours Per Room**: Number of occupants per labor room
- **Room Types**: Labor rooms and supervisor rooms distribution

## 2. Area Calculations

### 2.1 Level Definitions and Multipliers
The system calculates areas for each level type with specific multipliers:
- **Basement**: Multiplied by number of basement levels
- **Ground Floor**: Single level
- **Podium**: Multiplied by number of podium levels
- **Typical Floor**: Multiplied by number of typical floors
- **Hotel**: Multiplied by number of hotel floors
- **Retail/Commercial**: Multiplied by respective floor counts

### 2.2 Area Components per Level
Each level has several area components:
- **Sellable GFA**: Directly usable space (apartments, retail spaces, offices)
- **Common GFA**: Shared spaces (corridors, lobbies, staircases, lifts)
- **Service Areas**: Mechanical and utility spaces
- **Parking Areas**: Dedicated parking spaces
- **Balcony/Terrace Areas**: Outdoor spaces

## 3. Block-Based System

### 3.1 Block Categories
- **GFA Blocks**: Contribute to Gross Floor Area (rooms, corridors, lobbies)
- **Service Blocks**: Utility spaces (electrical rooms, pump rooms, etc.)
- **Built-up Blocks**: Non-GFA spaces (terraces, play areas)

### 3.2 Predefined Blocks
Hundreds of predefined blocks are available for different functions:
- **Staircases**: Various sizes for different levels
- **Lifts**: Standard elevator sizes
- **Electrical Rooms**: Power distribution spaces
- **Water Systems**: Tanks, pumps, meters
- **Specialized Areas**: Restaurants, gyms, storage

### 3.3 Composite Block Groups
Predefined combinations of blocks form functional core areas:
- **Residential Core**: Typical floor service core
- **Ground Floor Core**: Main entrance and primary services
- **Basement Core**: Parking and utility services

## 4. Parking Calculations

### 4.1 Parking Requirements by Use Type
- **Residential**: Based on unit mix (1-3 spaces per unit depending on size)
- **Retail**: 1 space per 50-70 m²
- **Office**: 1 space per 50 m²
- **Hotel**: Varies by room type (1 per 2-5 rooms)

### 4.2 Parking Provision
- **Basement Parking**: Primary parking location
- **Podium Parking**: Secondary parking location
- **Ground Floor Parking**: Limited visitor parking

## 5. Vertical Transportation

### 5.1 Lift Requirements
Calculated based on:
- **Total Occupancy Load**: Sum of all occupants in the building
- **Number of Floors**: Above-ground floor count
- **Lift Matrix**: Predefined matrix determining lift count

### 5.2 Staircase Requirements
Based on occupancy load:
- 0-499 occupants: 2 exits
- 500-1000 occupants: 3 exits
- 1001+ occupants: 4 exits

## 6. Cost Analysis Parameters

### 6.1 Construction Costs
- **Basement Rate**: Cost per sq.ft. for basement construction
- **Ground Floor Rate**: Cost per sq.ft. for ground floor construction
- **Upper Floors Rate**: Cost per sq.ft. for typical floors

### 6.2 Additional Costs
- **Consultancy Fees**: Percentage of construction cost
- **Land Cost**: Price per sq.ft. of plot area
- **Municipal Charges**: Fees per sq.ft. of BUA
- **Electrical Connection**: Fixed or variable cost
- **Soil Testing**: Fixed cost
- **Rate Multiplier**: Overall cost adjustment factor

## 7. Revenue Analysis Parameters

### 7.1 Buying Revenue
- **Residential Rates**: Price per sq.ft. for different unit types
- **Retail Rates**: Price per sq.ft. for retail spaces
- **Office Rates**: Price per sq.ft. for office spaces
- **Hotel Rates**: Price per key for hotel rooms

### 7.2 Renting Revenue
- **Residential Rents**: Annual rent per unit type
- **Retail Rents**: Annual rent per sq.ft. for retail
- **Office Rents**: Annual rent per sq.ft. for office
- **Hotel Rents**: Annual rent per key

## 8. Efficiency Metrics

### 8.1 GFA Efficiency
Calculated as: (Total Sellable Area / Total GFA) × 100

### 8.2 BUA Efficiency
Calculated as: (Total Sellable Area / Total BUA) × 100

## 9. Regulatory Compliance

### 9.1 Setback Requirements
Based on total number of floors above ground:
- 1-4 floors: 3m setbacks
- 5 floors: 3.75m setbacks
- 6 floors: 4.50m setbacks
- And so on up to 7.50m for 10+ floors

### 9.2 FAR (Floor Area Ratio)
Calculated as: Total GFA / Plot Area

## 10. Specialized Calculations

### 10.1 School Requirements
- **Play Area**: 2× classroom area
- **Covered Play Area**: 50% of total play area
- **Parking**: Based on classroom count and administrative area
- **Toilets**: Based on student and staff counts
- **Garbage Collection**: Based on area size

### 10.2 Labour Camp Requirements
- **Room Count**: Based on total area and room size
- **Occupancy**: Based on rooms × persons per room
- **WC Requirements**: 1 per 10 occupants
- **Showers**: 1 per 10 occupants
- **Washbasins**: 1 per 10 occupants

## 11. Technical Implementation Details

### 11.1 Level Processing Order
1. Basement
2. Basement_Last
3. Ground_Floor
4. Mezzanine
5. Retail
6. Supermarket
7. Podium
8. Podium_Last
9. Office
10. Commercial
11. Typical_Floor
12. Hotel
13. LabourCamp
14. Warehouse
15. School
16. Roof

### 11.2 Area Calculation Methodology
Areas are calculated using polygon geometry processing:
- Polygon area calculation using shoelace formula
- Scale conversion from drawing units to meters
- Aggregation across multiple floors using multipliers

### 11.3 Manual Overrides
All calculated values can be manually overridden:
- Sellable GFA per level
- Common GFA per level
- Service area per level
- Parking area per level
- Balcony/Terrace area per level

## 12. Reporting Features

### 12.1 Summary Report
- High-level overview of all key metrics
- GFA vs. Allowed comparison
- Efficiency percentages
- Parking surplus/deficit
- Lift and staircase analysis

### 12.2 Detailed Report
- Level-by-level breakdown
- Component area details
- Cost analysis
- Revenue projections
- Profitability analysis

### 12.3 Export Capabilities
- PDF generation with customizable layouts
- Screenshot gallery of floor plans
- Watermark protection
- Header/footer branding
- Automated filename generation with plot info, building type, floor count, report type and date
- OCR integration for extracting plot numbers from drawings (placeholder implementation)

## 13. OCR Integration for Plot Information

### 13.1 Current Implementation
The system includes a placeholder OCR function that simulates extracting plot numbers from polygon drawings. In a production environment, this would be replaced with an actual OCR implementation using libraries like Tesseract.js.

### 13.2 PDF Filename Structure
Generated PDF filenames follow this format:
`{Plot_Number}_{Building_Type}_F{Floor_Count}_{Report_Type}_{Date}.pdf`

Example: `PL-OCR-452_RES_F15_detailed_2026-03-29.pdf`

Where:
- Plot_Number: Extracted via OCR from plot polygon
- Building_Type: Acronym for project type (RES, HTL, SCH, LC, VIL, WH)
- Floor_Count: Total number of floors in the building
- Report_Type: 'brief' or 'detailed' based on user selection
- Date: Generation date in YYYY-MM-DD format

## Conclusion
This comprehensive system uses dozens of interconnected parameters to derive detailed feasibility solutions for various building types. Each parameter affects multiple calculations, creating a holistic approach to building design and financial analysis. The modular nature of the system allows for customization while maintaining regulatory compliance and industry best practices. The enhanced reporting features with OCR integration provide professional-grade deliverables with automated naming conventions.