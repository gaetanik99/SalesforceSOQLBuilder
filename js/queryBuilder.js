class QueryBuilder {
    constructor() {
        this.selectedObject = '';
        this.conditions = [];
        this.orderByField = '';
        this.orderDirection = 'ASC';
        this.limit = '';
        this.selectedFields = ['Id']; // Default to Id
        
        this.bindEvents();
        this.setupEventListeners();
    }

    bindEvents() {
        // Object selection
        document.querySelector('#objectSelect').addEventListener('change', (e) => {
            this.selectedObject = e.target.value;
            this.updateQuery();
        });

        // Add condition button
        document.querySelector('#addCondition').addEventListener('click', () => {
            this.addCondition();
        });

        // Order by field
        document.querySelector('#orderByField').addEventListener('change', (e) => {
            this.orderByField = e.target.value;
            this.updateQuery();
        });

        // Order direction
        document.querySelector('#orderDirection').addEventListener('change', (e) => {
            this.orderDirection = e.target.value;
            this.updateQuery();
        });

        // Limit
        document.querySelector('#limitInput').addEventListener('input', (e) => {
            this.limit = e.target.value;
            this.updateQuery();
        });

        // Copy query button
        document.querySelector('#copyQuery').addEventListener('click', () => {
            this.copyQuery();
        });
    }

    setupEventListeners() {
        // Event delegation for condition changes
        document.querySelector('#conditionsContainer').addEventListener('change', (e) => {
            if (e.target.matches('.condition-field, .condition-operator, .condition-value, .logical-operator')) {
                this.updateConditionFromEvent(e);
            }
        });

        // Event delegation for remove condition
        document.querySelector('#conditionsContainer').addEventListener('click', (e) => {
            if (e.target.matches('.remove-condition, .remove-condition .material-icons')) {
                const row = e.target.closest('.condition-row');
                if (row) {
                    row.remove();
                    this.updateConditionsArray();
                    this.updateQuery();
                }
            }
        });
    }

    addCondition() {
        const container = document.querySelector('#conditionsContainer');
        const conditionRow = document.createElement('div');
        conditionRow.className = 'condition-row';
        
        conditionRow.innerHTML = `
            <div class="select-wrapper">
                <select class="material-select condition-field">
                    <option value="">Select field</option>
                    <option value="Id">Id</option>
                    <option value="Name">Name</option>
                    <!-- Add more fields as needed -->
                </select>
                <span class="material-icons">expand_more</span>
            </div>
            
            <div class="select-wrapper">
                <select class="material-select condition-operator">
                    <option value="=">=</option>
                    <option value="!=">!=</option>
                    <option value="LIKE">LIKE</option>
                    <option value="IN">IN</option>
                    <option value="NOT IN">NOT IN</option>
                </select>
                <span class="material-icons">expand_more</span>
            </div>
            
            <input type="text" class="material-input condition-value" placeholder="Value">
            
            <div class="select-wrapper">
                <select class="material-select logical-operator">
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                </select>
                <span class="material-icons">expand_more</span>
            </div>
            
            <button class="icon-button remove-condition" title="Remove condition">
                <span class="material-icons">close</span>
            </button>
        `;
        
        container.appendChild(conditionRow);
        this.updateConditionsArray();
        this.updateQuery();
    }

    updateConditionFromEvent(event) {
        const row = event.target.closest('.condition-row');
        if (row) {
            this.updateConditionsArray();
            this.updateQuery();
        }
    }

    updateConditionsArray() {
        this.conditions = [];
        document.querySelectorAll('.condition-row').forEach((row, index) => {
            const field = row.querySelector('.condition-field').value;
            const operator = row.querySelector('.condition-operator').value;
            const value = row.querySelector('.condition-value').value;
            const logicalOp = row.querySelector('.logical-operator').value;
            
            if (field && operator && value) {
                this.conditions.push({
                    field,
                    operator,
                    value,
                    logicalOp: index < document.querySelectorAll('.condition-row').length - 1 ? logicalOp : null
                });
            }
        });
    }

    buildWhereClause() {
        if (this.conditions.length === 0) return '';
        
        let whereClause = ' WHERE ';
        let needsParentheses = false;
        let hasOR = this.conditions.some(c => c.logicalOp === 'OR');
        
        this.conditions.forEach((condition, index) => {
            if (index > 0) {
                whereClause += ` ${this.conditions[index - 1].logicalOp} `;
                if (hasOR && this.conditions[index - 1].logicalOp === 'OR') {
                    needsParentheses = true;
                }
            }
            
            let valueStr = condition.value;
            if (condition.operator === 'LIKE') {
                valueStr = `'%${valueStr}%'`;
            } else if (condition.operator === 'IN' || condition.operator === 'NOT IN') {
                valueStr = `(${valueStr.split(',').map(v => `'${v.trim()}'`).join(', ')})`;
            } else if (!valueStr.startsWith('$')) {
                valueStr = `'${valueStr}'`;
            }
            
            whereClause += `${condition.field} ${condition.operator} ${valueStr}`;
        });
        
        return needsParentheses ? ` WHERE (${whereClause.substring(7)})` : whereClause;
    }

    updateQuery() {
        let query = `SELECT `;
        
        // If no fields are selected, use Id as default
        query += this.selectedFields.join(', ');
        
        // Add FROM clause
        query += ` FROM ${this.selectedObject || 'Account'}`;
        
        // Add WHERE clause
        query += this.buildWhereClause();
        
        // Add ORDER BY
        if (this.orderByField) {
            query += ` ORDER BY ${this.orderByField} ${this.orderDirection}`;
        }
        
        // Add LIMIT
        if (this.limit) {
            query += ` LIMIT ${this.limit}`;
        }
        
        document.querySelector('#generatedQuery').textContent = query;
    }

    async copyQuery() {
        const query = document.querySelector('#generatedQuery').textContent;
        try {
            await navigator.clipboard.writeText(query);
            // Show success feedback
            const copyBtn = document.querySelector('#copyQuery');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy query:', err);
        }
    }
}

// Initialize the query builder when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.queryBuilder = new QueryBuilder();
});
