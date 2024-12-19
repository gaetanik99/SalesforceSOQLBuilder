class SOQLQueryBuilder {
    constructor() {
        this.selectedObject = '';
        this.selectedFields = ['Id']; // Default to Id
        this.conditions = [];
        this.orderByField = '';
        this.orderDirection = 'ASC';
        this.limit = '';
        this.availableFields = []; // Store available fields
        
        this.initializeUI();
        this.setupEventListeners();
    }

    initializeUI() {
        // Initialize UI elements
        this.objectSelect = document.getElementById('objectSelect');
        this.whereConditions = document.getElementById('whereConditions');
        this.orderByField = document.getElementById('orderByField');
        this.orderDirection = document.getElementById('orderDirection');
        this.limitInput = document.getElementById('limitInput');
        this.queryPreview = document.getElementById('queryPreview');
        
        // Load initial data
        this.loadSalesforceObjects();
    }

    setupEventListeners() {
        // Object selection
        this.objectSelect.addEventListener('change', () => {
            this.selectedObject = this.objectSelect.value;
            if (this.selectedObject) {
                this.loadObjectFields();
            }
            this.updateQueryPreview();
        });

        // Add condition button
        document.getElementById('addCondition').addEventListener('click', () => {
            this.addCondition();
        });

        // Copy query button
        document.getElementById('copyQuery').addEventListener('click', () => {
            this.copyQuery();
        });

        // Order by field
        this.orderByField.addEventListener('change', () => {
            this.updateQueryPreview();
        });

        // Order direction
        this.orderDirection.addEventListener('change', () => {
            this.updateQueryPreview();
        });

        // Limit input
        this.limitInput.addEventListener('input', () => {
            this.updateQueryPreview();
        });

        // Help modal
        const helpButton = document.getElementById('helpButton');
        const helpModal = document.getElementById('helpModal');
        const closeButton = helpModal.querySelector('.close-button');

        helpButton.addEventListener('click', () => {
            helpModal.classList.add('show');
        });

        closeButton.addEventListener('click', () => {
            helpModal.classList.remove('show');
        });

        // Close modal when clicking outside
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                helpModal.classList.remove('show');
            }
        });

        // Prevent modal content clicks from closing the modal
        helpModal.querySelector('.modal-content').addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    async loadSalesforceObjects() {
        try {
            // TODO: Replace with actual Salesforce API call
            const objects = [
                { name: 'Account', label: 'Account' },
                { name: 'Contact', label: 'Contact' },
                { name: 'Opportunity', label: 'Opportunity' }
            ];
            
            this.populateObjectSelect(objects);
            
            // If there's a selected object, load its fields
            if (this.selectedObject) {
                await this.loadObjectFields();
            }
        } catch (error) {
            console.error('Error loading Salesforce objects:', error);
        }
    }

    async loadObjectFields() {
        if (!this.selectedObject) return;

        try {
            // TODO: Replace with actual Salesforce API call
            this.availableFields = [
                { name: 'Id', label: 'ID', type: 'id' },
                { name: 'Name', label: 'Name', type: 'string' },
                { name: 'CreatedDate', label: 'Created Date', type: 'datetime' },
                { name: 'LastModifiedDate', label: 'Last Modified Date', type: 'datetime' },
                { name: 'OwnerId', label: 'Owner ID', type: 'reference' },
                { name: 'AccountNumber', label: 'Account Number', type: 'string' },
                { name: 'Type', label: 'Type', type: 'picklist' },
                { name: 'Industry', label: 'Industry', type: 'picklist' },
                { name: 'AnnualRevenue', label: 'Annual Revenue', type: 'currency' }
            ];
            
            this.updateAllFieldSelects();
        } catch (error) {
            console.error('Error loading object fields:', error);
        }
    }

    populateObjectSelect(objects) {
        this.objectSelect.innerHTML = '<option value="">Select an object</option>';
        objects.forEach(obj => {
            const option = document.createElement('option');
            option.value = obj.name;
            option.textContent = obj.label;
            this.objectSelect.appendChild(option);
        });
    }

    updateAllFieldSelects() {
        // Update field selects in all condition rows
        const fieldSelects = this.whereConditions.querySelectorAll('.field-select select');
        fieldSelects.forEach(select => this.populateFieldSelect(select));

        // Update ORDER BY field select
        this.populateFieldSelect(this.orderByField);
    }

    populateFieldSelect(select) {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Select field</option>';
        this.availableFields.forEach(field => {
            const option = document.createElement('option');
            option.value = field.name;
            option.textContent = field.label;
            select.appendChild(option);
        });
        if (currentValue && this.availableFields.some(f => f.name === currentValue)) {
            select.value = currentValue;
        }
    }

    addCondition() {
        const conditionRow = document.createElement('div');
        conditionRow.className = 'condition-row';
        conditionRow.innerHTML = `
            <div class="select-wrapper field-select">
                <select class="material-select">
                    <option value="">Select field</option>
                </select>
                <span class="material-icons">expand_more</span>
            </div>
            <div class="select-wrapper operator-select">
                <select class="material-select">
                    <option value="=">=</option>
                    <option value="!=">!=</option>
                    <option value="LIKE">LIKE</option>
                    <option value=">">></option>
                    <option value="<"><</option>
                    <option value=">=">>=</option>
                    <option value="<="><=</option>
                    <option value="IN">IN</option>
                    <option value="NOT IN">NOT IN</option>
                </select>
                <span class="material-icons">expand_more</span>
            </div>
            <div class="value-input-wrapper">
                <input type="text" class="material-input" placeholder="Value">
            </div>
            <div class="select-wrapper logical-operator-select">
                <select class="material-select">
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                </select>
                <span class="material-icons">expand_more</span>
            </div>
            <button class="icon-button remove-condition">
                <span class="material-icons">close</span>
            </button>
        `;

        // Add event listeners
        const fieldSelect = conditionRow.querySelector('.field-select select');
        const operatorSelect = conditionRow.querySelector('.operator-select select');
        const valueInput = conditionRow.querySelector('.value-input-wrapper input');
        const logicalOperatorSelect = conditionRow.querySelector('.logical-operator-select select');
        const removeButton = conditionRow.querySelector('.remove-condition');

        // Populate field select if fields are available
        if (this.availableFields.length > 0) {
            this.populateFieldSelect(fieldSelect);
        }

        // Event listeners
        fieldSelect.addEventListener('change', () => this.updateQueryPreview());
        operatorSelect.addEventListener('change', () => this.updateQueryPreview());
        valueInput.addEventListener('input', () => this.updateQueryPreview());
        logicalOperatorSelect.addEventListener('change', () => this.updateQueryPreview());
        removeButton.addEventListener('click', () => {
            conditionRow.remove();
            this.updateQueryPreview();
        });

        this.whereConditions.appendChild(conditionRow);
        this.updateQueryPreview();
    }

    buildQuery() {
        if (!this.selectedObject) return '';

        let query = `SELECT ${this.selectedFields.join(', ')} FROM ${this.selectedObject}`;

        // Build WHERE clause
        const rows = Array.from(this.whereConditions.querySelectorAll('.condition-row'));
        if (rows.length === 0) return query;

        // First, build all conditions
        const conditions = [];
        let hasOR = false;
        let currentGroup = [];
        
        rows.forEach((row, index) => {
            const field = row.querySelector('.field-select select').value;
            const operator = row.querySelector('.operator-select select').value;
            const value = row.querySelector('.value-input-wrapper input').value;
            const logicalOperator = row.querySelector('.logical-operator-select select').value;

            if (field && operator && value) {
                let formattedValue = value;
                if (operator === 'LIKE') {
                    formattedValue = `'%${value}%'`;
                } else if (operator === 'IN' || operator === 'NOT IN') {
                    formattedValue = `(${value.split(',').map(v => `'${v.trim()}'`).join(', ')})`;
                } else if (isNaN(value) || value.trim() === '') {
                    formattedValue = `'${value}'`;
                }

                const condition = `${field} ${operator} ${formattedValue}`;
                
                if (index < rows.length - 1) {
                    // Not the last row, check next operator
                    if (logicalOperator === 'OR') {
                        hasOR = true;
                        currentGroup.push(condition);
                    } else {
                        if (currentGroup.length > 0) {
                            // End of OR group
                            currentGroup.push(condition);
                            conditions.push(`(${currentGroup.join(' OR ')})`);
                            currentGroup = [];
                        } else {
                            conditions.push(condition);
                        }
                    }
                } else {
                    // Last row
                    if (currentGroup.length > 0) {
                        currentGroup.push(condition);
                        conditions.push(`(${currentGroup.join(' OR ')})`);
                    } else {
                        conditions.push(condition);
                    }
                }
            }
        });

        // Add WHERE clause
        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        // Add ORDER BY
        const orderByField = this.orderByField.value;
        if (orderByField) {
            query += ` ORDER BY ${orderByField} ${this.orderDirection.value}`;
        }

        // Add LIMIT
        const limit = this.limitInput.value;
        if (limit && !isNaN(limit) && limit.trim() !== '') {
            query += ` LIMIT ${limit}`;
        }

        return query;
    }

    updateQueryPreview() {
        const query = this.buildQuery();
        if (this.queryPreview) {
            this.queryPreview.textContent = query;
        }
    }

    async copyQuery() {
        const query = this.buildQuery();
        try {
            await navigator.clipboard.writeText(query);
            // TODO: Show success notification
        } catch (error) {
            console.error('Failed to copy query:', error);
            // TODO: Show error notification
        }
    }
}

// Initialize the query builder when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.queryBuilder = new SOQLQueryBuilder();
});
